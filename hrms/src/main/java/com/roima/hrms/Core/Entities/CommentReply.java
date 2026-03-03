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
@Table(name = "comment_replies")
public class CommentReply extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment parentComment;

    @Column(nullable = false, length = 500)
    private String content;

    @OneToMany(mappedBy = "commentReply", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CommentReplyLike> likes = new HashSet<>();
}

