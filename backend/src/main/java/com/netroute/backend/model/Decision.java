package com.netroute.backend.model;

import jakarta.persistence.*;

@Entity
public class Decision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;
    private String fromServer;
    private String toServer;
    private String reason;
    private boolean verified;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getFromServer() {
        return fromServer;
    }

    public void setFromServer(String fromServer) {
        this.fromServer = fromServer;
    }

    public String getToServer() {
        return toServer;
    }

    public void setToServer(String toServer) {
        this.toServer = toServer;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }
}
