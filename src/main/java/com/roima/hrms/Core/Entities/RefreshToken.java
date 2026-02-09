package com.roima.hrms.Core.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken extends BaseEntity {

    private String TokenHash;

    private LocalDateTime expires_at;

    private LocalDateTime revoked_at;

    private String replaced_by_tokenHash;

    private String reason_revoked;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
