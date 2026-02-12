package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
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

    private LocalDateTime last_login;

    private boolean is_active = true;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    // hierarchy
    @ManyToOne
    @JoinColumn(name = "reports_to", nullable = true)
    private User reports_to;

    @OneToMany(mappedBy = "reports_to", fetch = FetchType.LAZY)
    private Set<User> reports_to_me;

    @OneToMany(mappedBy = "recipient", fetch = FetchType.LAZY)
    private Set<Notification> my_notifications = new HashSet<>();

    @OneToMany(mappedBy = "actor", fetch = FetchType.LAZY)
    private Set<Notification> sent_notifications = new HashSet<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
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
    private Set<Referral> my_referrals = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<SlotParticipant> my_participation = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<TravelMember> my_travel = new HashSet<>();

    @OneToMany(mappedBy = "uploadedBy", fetch = FetchType.LAZY)
    private Set<TravelDocument> my_travel_docs = new HashSet<>();

    @OneToMany(mappedBy = "uploadedBy", fetch = FetchType.LAZY)
    private Set<ExpenseDocument> my_expense_docs = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<GameInterest> game_interests = new HashSet<>();

    @OneToMany(mappedBy = "paid_by", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TravelExpense> my_travel_expenses = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<RefreshToken> refresh_tokens = new HashSet<>();

    @OneToMany(mappedBy = "approved_by", fetch = FetchType.LAZY)
    private Set<TravelExpense> my_approved_expenses;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<JobSharingRecord> my_shared_jobs;

    @OneToMany(mappedBy = "default_reviewer", fetch = FetchType.LAZY)
    private Set<Job> jobs_under_my_review;
}