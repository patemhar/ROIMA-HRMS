package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Dtos.Util.departmentOptions;
import com.roima.hrms.Dtos.Util.gameOptions;
import com.roima.hrms.Dtos.Util.roleOptions;
import com.roima.hrms.Dtos.Util.userOptions;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface utilService {

    List<departmentOptions> getAllDepartments();

    List<userOptions> getAllUsers();

    List<userOptions> getUsersOfTravel(UUID travelId);

    List<roleOptions> getRoles();

    List<gameOptions> getGames();
}
