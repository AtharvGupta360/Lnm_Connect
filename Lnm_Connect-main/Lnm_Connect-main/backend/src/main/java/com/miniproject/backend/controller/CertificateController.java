
package com.miniproject.backend.controller;
import org.springframework.data.mongodb.gridfs.GridFsResource;


import com.miniproject.backend.model.Certificate;
import com.miniproject.backend.repository.CertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "*")

public class CertificateController {
    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private GridFsTemplate gridFsTemplate;

    @GetMapping("/user/{userId}")
    public List<Certificate> getCertificatesByUser(@PathVariable String userId) {
        return certificateRepository.findByUserId(userId);
    }


    // Upload certificate file to MongoDB GridFS and create certificate
    @PostMapping(value = "/upload", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public Certificate uploadCertificate(
            @RequestParam("userId") String userId,
            @RequestParam("title") String title,
            @RequestParam("organization") String organization,
            @RequestParam("date") String date,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {
        System.out.println("[DEBUG] Uploading certificate for userId=" + userId + ", title=" + title);
        String fileUrl = null;
        if (file != null && !file.isEmpty()) {
            // Store file in GridFS
            String fileId = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType()).toString();
            fileUrl = "/api/certificates/file/" + fileId;
            System.out.println("[DEBUG] File uploaded to GridFS with fileId=" + fileId);
        } else {
            System.out.println("[DEBUG] No file uploaded.");
        }
        Certificate cert = new Certificate(userId, title, organization, date, fileUrl);
        Certificate saved = certificateRepository.save(cert);
        System.out.println("[DEBUG] Certificate saved with id=" + saved.getId() + ", fileUrl=" + fileUrl);
        return saved;
    }

    // Download/view certificate file by certificate id (fetch from GridFS)
    @GetMapping("/file/{id}")
    public ResponseEntity<?> getCertificateFileByCertId(@PathVariable String id) {
        try {
            Certificate cert = certificateRepository.findById(id).orElse(null);
            if (cert == null || cert.getFileUrl() == null || !cert.getFileUrl().contains("/file/")) {
                return ResponseEntity.status(404).body(new ApiError("Certificate or file not found"));
            }
            // Extract fileId from fileUrl
            String fileId = cert.getFileUrl().substring(cert.getFileUrl().lastIndexOf("/") + 1);
            GridFSFile gridFsFile = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(fileId)));
            if (gridFsFile == null) {
                return ResponseEntity.status(404).body(new ApiError("File not found in GridFS"));
            }
            GridFsResource resource = gridFsTemplate.getResource(gridFsFile);
            String filename = gridFsFile.getFilename();
            String contentType = resource.getContentType() != null ? resource.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiError("Internal server error: " + e.getMessage()));
        }
    }

    // Simple error response class
    static class ApiError {
        public String message;
        public ApiError(String message) { this.message = message; }
        public String getMessage() { return message; }
    }


    // Optionally: update certificate metadata (not file)
    @PutMapping("/{id}")
    public Certificate updateCertificate(@PathVariable String id, @RequestBody Certificate cert) {
        return certificateRepository.findById(id).map(c -> {
            c.setTitle(cert.getTitle());
            c.setOrganization(cert.getOrganization());
            c.setDate(cert.getDate());
            c.setFileUrl(cert.getFileUrl());
            return certificateRepository.save(c);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteCertificate(@PathVariable String id) {
        certificateRepository.deleteById(id);
    }
}
