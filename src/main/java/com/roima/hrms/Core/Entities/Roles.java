package com.roima.hrms.Core.Entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
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
@Table(name = "roles")
public class Roles extends BaseEntity{

    private String name;

    private String description;

    @OneToMany(mappedBy = "role", cascade = CascadeType.DETACH)
    private Set<User> users = new HashSet<>();
}
