
package com.learnify.repository;

import com.learnify.model.User;
import com.learnify.model.VideoCallSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoCallScheduleRepository extends JpaRepository<VideoCallSchedule, Long> {
    List<VideoCallSchedule> findByUser(User user);
    Optional<VideoCallSchedule> findByCallId(String callId);
}
