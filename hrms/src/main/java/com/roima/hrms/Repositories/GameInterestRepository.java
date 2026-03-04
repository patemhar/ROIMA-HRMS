package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Game;
import com.roima.hrms.Core.Entities.GameInterest;
import com.roima.hrms.Core.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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
        SELECT gi FROM GameInterest gi
        WHERE gi.user.id = :userId
    """)
    List<GameInterest> getUserInterests(UUID userId);

    @Query("""
        SELECT CASE WHEN COUNT(gi) > 0 THEN true ELSE false END
        FROM GameInterest gi
        WHERE gi.user.id = :userId AND gi.game.id = :gameId
    """)
    boolean existsByUserAndGame(UUID userId, UUID gameId);

    //     delete interest
    @Modifying
    @Transactional
    @Query("""
        DELETE FROM GameInterest gi 
        WHERE gi.game.id = :gameId AND gi.user.id = :userId
    """)
    void deleteInterest(UUID userId, UUID gameId);


//    @Query("""
//        SELECT COUNT(gi)
//        FROM GameInterest gi
//        WHERE gi.game.id = :gameId
//    """)
//    Integer countInterestedUsers(UUID gameId);

}
