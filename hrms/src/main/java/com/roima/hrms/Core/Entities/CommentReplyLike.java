package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "comment_reply_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "comment_reply_id"})
})
public class CommentReplyLike extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "comment_reply_id", nullable = false)
    private CommentReply commentReply;
}

