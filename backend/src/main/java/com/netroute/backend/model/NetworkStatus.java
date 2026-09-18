package com.netroute.backend.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
@Entity
public class NetworkStatus{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String serverId;
    private double latencyMs;
    private double packetLossPercent;
    private double loadPercent;
    private String status;
    public Long getId(){
        return id;
    }
    public void setId(Long id){
        this.id = id;
    }
    public String getServerId(){
        return serverId;
    }
    public void setServerId(String serverId){
        this.serverId = serverId;
    }
    public double getLatencyMs(){
        return latencyMs;
    }
    public void setLatencyMs(double l){
        this.latencyMs = l;
    }
    public double getpacketLossPercent(){
        return packetLossPercent;
    }
    public void setPacketLossPercent(double p){
        this.packetLossPercent = p;
    }
    public double getLoadPercent(){
        return loadPercent;
    }
    public void setLoadPercent(double l){
        this.loadPercent =l;
    }
    public String getStatus(){
        return status;
    }
    public void setStatus(String status){
        this.status = status;
    }
}