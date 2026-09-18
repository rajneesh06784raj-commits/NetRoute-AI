package com.netroute.backend.repository;

import com.netroute.backend.model.NetworkStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NetworkStatusRepository extends JpaRepository<NetworkStatus, Long> {
}