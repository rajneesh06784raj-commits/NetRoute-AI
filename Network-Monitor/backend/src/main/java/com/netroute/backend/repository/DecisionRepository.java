package com.netroute.backend.repository;

import com.netroute.backend.model.Decision;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DecisionRepository extends JpaRepository<Decision, Long> {
}