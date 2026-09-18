package com.netroute.backend.controller;

import com.netroute.backend.model.Prediction;
import com.netroute.backend.repository.PredictionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/network")
public class PredictionController {

    @Autowired
    private PredictionRepository repository;

    @PostMapping("/prediction")
    public Prediction savePrediction(@RequestBody Prediction prediction) {
        return repository.save(prediction);
    }

    @GetMapping("/prediction")
    public List<Prediction> getAllPredictions() {
        return repository.findAll();
    }
}