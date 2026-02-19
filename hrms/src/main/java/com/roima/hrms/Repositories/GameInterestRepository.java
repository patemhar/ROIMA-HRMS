package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.GameInterest;
import com.roima.hrms.Core.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GameInterestRepository extends JpaRepository<GameInterest, UUID> {

    @Query("""
        SELECT COUNT(gi) FROM GameInterest gi
        WHERE gi.game.id = :gameId
    """)
    Integer countInterestedUsers(UUID gameId);

    @Query("""
        SELECT gi.user FROM GameInterest gi
        WHERE gi.game.id = :gameId
    """)
    List<User> getInterestedUsers(UUID gameId);

    @Query("""
        SELECT gi.game.name FROM GameInterest gi
        WHERE gi.user.id = :userId
    """)
    List<String> getUserInterests(UUID userId);

//    @Query("""
//        SELECT COUNT(gi)
//        FROM GameInterest gi
//        WHERE gi.game.id = :gameId
//    """)
//    Integer countInterestedUsers(UUID gameId);

}
