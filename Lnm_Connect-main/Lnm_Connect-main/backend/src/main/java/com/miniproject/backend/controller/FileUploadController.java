package com.miniproject.backend.controller;

import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import com.mongodb.client.gridfs.model.GridFSFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Autowired
    private GridFsTemplate gridFsTemplate;

    @Autowired
    private UserRepository userRepository;

    /**
     * Upload profile picture
     * Accepts a multipart file and stores it in MongoDB GridFS
     * Returns the file URL that can be used as photoUrl
     */
    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Validate file type (images only)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 5MB"));
            }

            // Verify user exists
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            // Delete old profile picture if exists
            if (user.getPhotoUrl() != null && user.getPhotoUrl().contains("/api/upload/file/")) {
                String oldFileId = user.getPhotoUrl().substring(user.getPhotoUrl().lastIndexOf("/") + 1);
                try {
                    gridFsTemplate.delete(new Query(Criteria.where("_id").is(oldFileId)));
                } catch (Exception e) {
                    // Ignore if file not found
                }
            }

            // Store file in GridFS
            ObjectId fileId = gridFsTemplate.store(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    contentType
            );

            // Create file URL
            String fileUrl = "http://localhost:8080/api/upload/file/" + fileId.toString();

            // Update user's photoUrl
            user.setPhotoUrl(fileUrl);
            userRepository.save(user);

            // Return response
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile picture uploaded successfully");
            response.put("photoUrl", fileUrl);
            response.put("fileId", fileId.toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Get file by ID
     * Retrieves file from GridFS and returns it
     */
    @GetMapping("/file/{fileId}")
    public ResponseEntity<byte[]> getFile(@PathVariable String fileId) {
        try {
            GridFSFile gridFSFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(fileId)));
            
            if (gridFSFile == null) {
                return ResponseEntity.notFound().build();
            }

            GridFsResource resource = gridFsTemplate.getResource(gridFSFile);
            
            String contentType = gridFSFile.getMetadata() != null 
                    ? gridFSFile.getMetadata().get("_contentType", String.class)
                    : "image/jpeg";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource.getInputStream().readAllBytes());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete profile picture
     */
    @DeleteMapping("/profile-picture")
    public ResponseEntity<?> deleteProfilePicture(@RequestParam String userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            // Delete file from GridFS if exists
            if (user.getPhotoUrl() != null && user.getPhotoUrl().contains("/api/upload/file/")) {
                String fileId = user.getPhotoUrl().substring(user.getPhotoUrl().lastIndexOf("/") + 1);
                gridFsTemplate.delete(new Query(Criteria.where("_id").is(fileId)));
            }

            // Remove photoUrl from user
            user.setPhotoUrl(null);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Profile picture deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete file: " + e.getMessage()));
        }
    }
}
