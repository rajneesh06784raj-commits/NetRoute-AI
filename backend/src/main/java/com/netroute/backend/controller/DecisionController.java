package com.netroute.backend.controller;

import com.netroute.backend.model.Decision;
import com.netroute.backend.repository.DecisionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/network")
public class DecisionController {

    @Autowired
    private DecisionRepository repository;

    @PostMapping("/decision")
    public Decision saveDecision(@RequestBody Decision decision) {
        return repository.save(decision);
    }

    @GetMapping("/decision")
    public List<Decision> getAllDecisions() {
        return repository.findAll();
    }
}