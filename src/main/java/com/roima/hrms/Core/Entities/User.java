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
public class User extends BaseEntity{

    private String first_name;

    private String last_name;

    private String email;

    private String password_hash;

    private String last_login;

    private boolean is_active;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Roles role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reports_to")
    private User reports_to;

    @OneToMany(mappedBy = "reports_to")
    private Set<User> reports_to_me;

    @OneToMany(mappedBy = "recipient", fetch = FetchType.LAZY)
    private Set<Notifications> my_notifications = new HashSet<>();

    @OneToMany(mappedBy = "actor", fetch = FetchType.LAZY)
    private Set<Notifications> sent_notifications = new HashSet<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Profile profile;

    @OneToMany(mappedBy = "postOwner", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Post> user_posts = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<Like> my_likes = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<Comment> my_comments = new HashSet<>();

    @OneToMany(mappedBy = "created_by", fetch = FetchType.LAZY)
    private Set<Job> jobs_created_by_me = new HashSet<>();

    @OneToMany(mappedBy = "referred_by", fetch = FetchType.LAZY)
    private Set<Referrals> my_referrals = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<SlotParticipant> my_participation = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<TravelMember> my_travel = new HashSet<>();

    @OneToMany(mappedBy = "uploadedBy", fetch = FetchType.LAZY)
    private Set<Document> my_docs = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<GameInterests> game_interests;
}