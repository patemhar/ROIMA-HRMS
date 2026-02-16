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
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "posts")
public class Post extends BaseEntity{

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User postOwner;

    private String title;

    private String content;

    private boolean is_active;

    @ManyToOne
    @JoinColumn(name = "visibility_role")
    private Role visibility_role;

    @OneToMany(mappedBy = "post")
    private Set<PostMedia> media = new HashSet<>();

    @OneToMany(mappedBy = "post")
    private Set<Like> likes = new HashSet<>();

    @OneToMany(mappedBy = "post")
    private Set<Comment> comments = new HashSet<>();
}
