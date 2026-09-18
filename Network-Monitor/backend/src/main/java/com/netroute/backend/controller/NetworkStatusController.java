package com.netroute.backend.controller;

import com.netroute.backend.model.NetworkStatus;
import com.netroute.backend.repository.NetworkStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/network-status")
public class NetworkStatusController {

    @Autowired
    private NetworkStatusRepository repository;

    @GetMapping
    public List<NetworkStatus> getAllStatus() {
        return repository.findAll();
    }

    @PostMapping
    public NetworkStatus saveStatus(@RequestBody NetworkStatus status) {
        return repository.save(status);
    }
}