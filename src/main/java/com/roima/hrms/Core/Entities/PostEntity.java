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
public class PostEntity extends BaseEntity{

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity postOwner;

    private String title;

    private String content;

    @OneToMany(mappedBy = "post")
    private Set<PostMediaEntity> media = new HashSet<>();

    @OneToMany(mappedBy = "post")
    private Set<LikeEntity> likes = new HashSet<>();

    @OneToMany(mappedBy = "post")
    private Set<CommentEntity> comments = new HashSet<>();
}
