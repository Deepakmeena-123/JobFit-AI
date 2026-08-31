package com.nextstep.repository;

import com.nextstep.model.JDMatchResult;
import com.nextstep.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JDMatchRepository extends JpaRepository<JDMatchResult, Long> {
    List<JDMatchResult> findByUserOrderByCreatedAtDesc(User user);
}