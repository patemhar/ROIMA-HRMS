package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long documentId;

    @Enumerated(EnumType.STRING)
    private EntityType entityType;

    private Long entityId;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    private String fileUrl;

    @CreationTimestamp
    private LocalDateTime created_at;
}

