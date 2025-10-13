package com.miniproject.backend.controller;

import com.miniproject.backend.model.Club;
import com.miniproject.backend.repository.ClubRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin(origins = "*")
public class ClubController {
    @Autowired
    private ClubRepository clubRepository;

    @GetMapping
    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }
}
