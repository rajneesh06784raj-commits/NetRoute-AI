package com.netroute.backend.controller;

import com.netroute.backend.model.Decision;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/traffic")
public class TrafficController {

    private String activeServer = "server-1";

    @PostMapping("/redistribute")
    public String redistribute(@RequestBody Decision decision) {
        this.activeServer = decision.getToServer();

        return "Traffic rerouted to " + activeServer + " successfully.";}

    @GetMapping("/active-server")
    public String getActiveServer() {
        return activeServer;
    }
}