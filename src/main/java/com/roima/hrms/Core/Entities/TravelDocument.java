package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "travel_doc")
public class TravelDocument extends BaseEntity{

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @ManyToOne
    @JoinColumn(name = "travel_id")
    private Travel travel;

    private String doc_url;

}

