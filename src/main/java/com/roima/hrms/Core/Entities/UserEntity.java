package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class UserEntity {

    private String first_name;

    private String last_name;

    private String email;

    private String password_hash;

    private String last_login;

    private boolean is_active;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private RolesEntity role;

    @OneToMany(mappedBy = "reports_to")
    private Set<UserEntity> reports_to_me = new HashSet<>();

    @OneToMany(mappedBy = "recipient", fetch = FetchType.LAZY)
    private Set<NotificationsEntity> my_notifications = new HashSet<>();

    @OneToMany(mappedBy = "actor", fetch = FetchType.LAZY)
    private Set<NotificationsEntity> sent_notifications = new HashSet<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private ProfileEntity profile;

    @OneToMany(mappedBy = "postOwner", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<PostEntity> user_posts = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<LikeEntity> my_likes = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<CommentEntity> my_comments = new HashSet<>();

    @OneToMany(mappedBy = "created_by", fetch = FetchType.LAZY)
    private Set<JobEntity> jobs_created_by_me = new HashSet<>();

    @OneToMany(mappedBy = "referred_by", fetch = FetchType.LAZY)
    private Set<ReferralsEntity> my_referrals = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<SlotParticipantEntity> my_participation = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<TravelMemberEntity> my_travel = new HashSet<>();

    @OneToMany(mappedBy = "uploadedBy", fetch = FetchType.LAZY)
    private Set<DocumentEntity> my_docs = new HashSet<>();
}