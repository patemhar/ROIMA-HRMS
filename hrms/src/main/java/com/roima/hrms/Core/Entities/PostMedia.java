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
@Table(name = "post_medias")
public class PostMedia extends BaseEntity{

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    private String media_url;
}
