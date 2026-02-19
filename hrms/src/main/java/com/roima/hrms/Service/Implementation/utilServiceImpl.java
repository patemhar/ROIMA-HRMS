package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Dtos.Util.departmentOptions;
import com.roima.hrms.Dtos.Util.gameOptions;
import com.roima.hrms.Dtos.Util.roleOptions;
import com.roima.hrms.Dtos.Util.userOptions;
import com.roima.hrms.Repositories.*;
import com.roima.hrms.Service.Interfaces.utilService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class utilServiceImpl implements utilService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final TravelMemberRepository travelMemberRepository;
    private final RoleRepository roleRepository;
    private final GameRepository gameRepository;

    @Override
    public List<departmentOptions> getAllDepartments() {

        var result = new ArrayList<departmentOptions>();

        var departments = departmentRepository.findAll();

        for(var department : departments) {

            var temp = new departmentOptions();

            temp.setDepartmentId(department.getId());
            temp.setName(department.getDepartment_code() + " - " + department.getDepartment_name());

            result.add(temp);
        }

        return result;
    }

    @Override
    public List<userOptions> getAllUsers() {

        var result = new ArrayList<userOptions>();

        var users = userRepository.findAll();

        for(var user : users) {

            var temp = new userOptions();

            temp.setUserId(user.getId());
            temp.setName(user.getFirst_name() + " " + user.getLast_name() + " - " + user.getRole().getName());

            result.add(temp);
        }

        return result;
    }

    @Override
    public List<userOptions> getUsersOfTravel(UUID travelId) {

        var result = new ArrayList<userOptions>();

        var members = travelMemberRepository.findAll();

        for(var member : members) {

            var temp = new userOptions();

            temp.setUserId(member.getUser().getId());
            temp.setName(member.getUser().getFirst_name() + " " + member.getUser().getLast_name());

            result.add(temp);
        }

        return result;
    }

    @Override
    public List<roleOptions> getRoles() {

        var result = new ArrayList<roleOptions>();

        var roles = roleRepository.findAll();

        for(var role : roles) {

            var temp = new roleOptions();

            temp.setId(role.getId());
            temp.setName(role.getName());

            result.add(temp);
        }

        return result;
    }

    @Override
    public List<gameOptions> getGames() {

        var result = new ArrayList<gameOptions>();

        var games = gameRepository.findAll();

        for(var game : games) {

            var temp = new gameOptions();

            temp.setId(game.getId());
            temp.setName(game.getName());

            result.add(temp);
        }

        return result;
    }

}
