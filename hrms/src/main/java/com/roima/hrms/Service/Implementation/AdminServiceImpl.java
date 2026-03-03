package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.Core.Enums.BookingRequestStatus;
import com.roima.hrms.Core.Enums.TravelStatus;
import com.roima.hrms.dtos.admin.*;
import com.roima.hrms.Exception.ResourceNotFoundException;
import com.roima.hrms.Mapper.*;
import com.roima.hrms.Repositories.*;
import com.roima.hrms.Service.Interfaces.AdminService;
import com.roima.hrms.dtos.game.GameSlotBookingRequestResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final TravelRepository travelRepository;
    private final JobRepository jobRepository;
    private final GameRepository gameRepository;
    private final PostRepository postRepository;
    private final SlotBookingRequestRepository slotBookingRequestRepository;
    private final TravelExpenseRepository travelExpenseRepository;
    private final ProfileRepository profileRepository;
    private final DepartmentMapper departmentMapper;
    private final RoleMapper roleMapper;
    private final UserMapper userMapper;
    private final TravelMapper travelMapper;
    private final JobMapper jobMapper;

    @Override
    public DashboardStatsDto getDashboardStats() {

        DashboardStatsDto stats = new DashboardStatsDto();

        List<User> allUsers = userRepository.findAll();
        stats.setTotalUsers((long) allUsers.size());
        stats.setActiveUsers(allUsers.stream().filter(User::isActive).count());
        stats.setInactiveUsers(allUsers.stream().filter(u -> !u.isActive()).count());

        stats.setTotalDepartments((long) departmentRepository.findAll().size());
        stats.setTotalRoles((long) roleRepository.findAll().size());

        List<Travel> allTravels = travelRepository.findAll();
        stats.setTotalTravels((long) allTravels.size());
        stats.setActiveTravels(allTravels.stream().filter(travel -> travel.getStatus() == TravelStatus.ONGOING).count());

        List<Job> allJobs = jobRepository.findAll();
        stats.setTotalJobs((long) allJobs.size());
        stats.setActiveJobs(allJobs.stream().filter(Job::isIsActive).count());

        stats.setTotalGames((long) gameRepository.findAll().size());

        stats.setTotalPosts((long) postRepository.findAll().size());

        List<SlotBookingRequest> allBookingRequests = slotBookingRequestRepository.findAll();
        stats.setPendingBookingRequests(
            allBookingRequests.stream()
                .filter(br -> br.getStatus() == BookingRequestStatus.PENDING)
                .count()
        );

        List<com.roima.hrms.Core.Entities.TravelExpense> allExpenses = travelExpenseRepository.findAll();
        stats.setTotalTravelExpenses((long) allExpenses.size());
        stats.setPendingExpenseApprovals(
            allExpenses.stream()
                .filter(e -> e.getApproved_by() == null && e.isActive())
                .count()
        );

        return stats;
    }

    @Override
    public SystemActivityDto getSystemActivity() {
        SystemActivityDto activity = new SystemActivityDto();

        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last24Hours = now.minusHours(24);

        List<User> allUsers = userRepository.findAll();

        activity.setRecentLogins(
            allUsers.stream()
                .filter(u -> u.getLast_login() != null && u.getLast_login().isAfter(last24Hours))
                .count()
        );

        activity.setNewUsersThisMonth(
            allUsers.stream()
                .filter(u -> u.getCreated_at() != null && u.getCreated_at().isAfter(startOfMonth))
                .count()
        );

        activity.setNewTravelsThisMonth(
            travelRepository.findAll().stream()
                .filter(t -> t.getCreated_at() != null && t.getCreated_at().isAfter(startOfMonth))
                .count()
        );

        // New jobs this month
        activity.setNewJobsThisMonth(
            jobRepository.findAll().stream()
                .filter(j -> j.getCreated_at() != null && j.getCreated_at().isAfter(startOfMonth))
                .count()
        );

        activity.setNewPostsThisMonth(
            postRepository.findAll().stream()
                .filter(p -> p.getCreated_at() != null && p.getCreated_at().isAfter(startOfMonth))
                .count()
        );

        return activity;
    }

    @Override
    public Page<DepartmentResponseDto> getAllDepartments(int pageNumber, int pageSize, String searchTerm) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        var departments = departmentRepository.find(searchTerm, pageable);

        return departments.map(departmentMapper::toDepartmentDto);
    }

    @Override
    public DepartmentResponseDto getDepartmentById(UUID departmentId) {
        Department department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));
        return departmentMapper.toDepartmentDto(department);
    }

    @Override
    @Transactional
    public DepartmentResponseDto createDepartment(DepartmentRequestDto request) {
        Department department = new Department();
        department.setDepartment_name(request.getDepartmentName());
        department.setDepartment_code(request.getDepartmentCode());

        Department savedDepartment = departmentRepository.save(department);

        log.info("Department created: {} ({})", savedDepartment.getDepartment_name(), savedDepartment.getDepartment_code());

        return departmentMapper.toDepartmentDto(savedDepartment);
    }

    @Override
    @Transactional
    public DepartmentResponseDto updateDepartment(UUID departmentId, DepartmentRequestDto request) {
        Department department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        department.setDepartment_name(request.getDepartmentName());
        department.setDepartment_code(request.getDepartmentCode());

        Department updatedDepartment = departmentRepository.save(department);

        log.info("Department updated: {}", updatedDepartment.getDepartment_name());

        return departmentMapper.toDepartmentDto(updatedDepartment);
    }

    @Override
    @Transactional
    public void deleteDepartment(UUID departmentId) {
        log.info("Department deleted: {}", departmentId);
        departmentRepository.deleteById(departmentId);
    }

    @Override
    public Page<RoleResponseDto> getAllRoles(int pageNumber, int pageSize, String searchTerm) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        var roles = roleRepository.find(searchTerm, pageable);

        return roles.map(roleMapper::toRoleResponse);
    }

    @Override
    public RoleResponseDto getRoleById(UUID roleId) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        return roleMapper.toRoleResponse(role);
    }

    @Override
    @Transactional
    public RoleResponseDto createRole(RoleRequestDto request) {
        Role role = new Role();
        role.setName(request.getName());
        role.setDescription(request.getDescription());

        Role savedRole = roleRepository.save(role);

        log.info("Role created: {}", savedRole.getName());

        return roleMapper.toRoleResponse(savedRole);
    }

    @Override
    @Transactional
    public RoleResponseDto updateRole(UUID roleId, RoleRequestDto request) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        role.setName(request.getName());
        role.setDescription(request.getDescription());

        Role updatedRole = roleRepository.save(role);

        log.info("Role updated: {}", updatedRole.getName());

        return roleMapper.toRoleResponse(updatedRole);
    }

    @Override
    @Transactional
    public void deleteRole(UUID roleId) {
        log.info("Role deleted: {}", roleId);
        roleRepository.deleteById(roleId);
    }


    @Override
    @Transactional
    public void toggleJobActiveStatus(UUID jobId) {
        com.roima.hrms.Core.Entities.Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        job.setIsActive(!job.isIsActive());
        jobRepository.save(job);

        log.info("Job status toggled: {} - {}", job.getTitle(), job.isIsActive() ? "ACTIVE" : "INACTIVE");
    }



}
