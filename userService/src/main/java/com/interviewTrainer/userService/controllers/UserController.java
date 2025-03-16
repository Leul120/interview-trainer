package com.interviewTrainer.userService.controllers;

import com.interviewTrainer.userService.entity.User;
import com.interviewTrainer.userService.repositories.UserRepository;
import com.interviewTrainer.userService.requests.*;
import com.interviewTrainer.userService.responses.ApiResponse;
import com.interviewTrainer.userService.responses.UserDetailsDTO;
import com.interviewTrainer.userService.responses.UserResponse;
import com.interviewTrainer.userService.responses.UserResponseDTO;
import com.interviewTrainer.userService.services.AuthenticationService;
import com.interviewTrainer.userService.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {
    private final UserService userService;
    private final AuthenticationService authenticationService;

    @Autowired
    public  UserController(AuthenticationService authenticationService, UserService userService){
        this.userService=userService;
        this.authenticationService=authenticationService;

    }
    @GetMapping
    public ResponseEntity<String> get(){
        return ResponseEntity.ok("hello world!");
    }
    @GetMapping("/")
    public ResponseEntity<ApiResponse> getSmt(){
        return ResponseEntity.ok(new ApiResponse("success","jhk"));
    }

    @GetMapping("/get-user/{email}")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email){
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }
    @GetMapping("/get-user-id")
    public ResponseEntity<UserResponse> getUser(@RequestAttribute("userId") UUID userId){
        return ResponseEntity.ok(userService.getUser(userId));
    }
    @PostMapping("/update-score/{userId}/{confidenceScore}/{overAllScore}")
    public void updateScore(@PathVariable UUID userId,@PathVariable double confidenceScore,@PathVariable double overAllScore){
        userService.updateConfidenceScore(userId,confidenceScore,overAllScore);
    }
//    @PreAuthorize("hasAnyAuthority('USER')")
    @GetMapping("/load-user-by-email/{email}")
    public ResponseEntity<UserDetailsDTO> loadUserByEmail(@PathVariable String email){
        UserDetails userDetails=userService.userDetailsService().loadUserByUsername(email);
        UserDetailsDTO userDetailsDTO=new UserDetailsDTO();
                userDetailsDTO.setUsername(userDetails.getUsername());
                userDetailsDTO.setPassword(userDetails.getPassword());
                userDetailsDTO.setRoles(userDetails.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority) // Convert each GrantedAuthority to a String
                        .collect(Collectors.toList()));
                return ResponseEntity.ok(userDetailsDTO);
    }

    @GetMapping("/check-user-by-email/{email}")
    public ResponseEntity<Boolean> checkUserByEmail(@PathVariable String email){
        return ResponseEntity.ok(userService.checkUserByEmail(email));
    }
    @GetMapping("/public/get-user-by-id/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID id){
        return ResponseEntity.ok(userService.getUserById(id));
    }
    @GetMapping("/get-user-by-id")
    public ResponseEntity<UserResponseDTO> getUserByIdd(@RequestAttribute("userId") UUID userId){
        System.out.println("userIDDD"+userId);
        return ResponseEntity.ok(userService.getUserById(userId));
    }
    @GetMapping("/public/get-interviewers")
    public ResponseEntity<List<UserResponse>> getInterviewers(){
        return ResponseEntity.ok(userService.getInterviewers());
    }
    @GetMapping("/online-status/{status}")
    public void setOnlineStatus(@RequestAttribute("userId") UUID userId,@PathVariable Boolean status){
        System.out.println(status);
        userService.setOnlineStatus(userId,status);
    }
    @PostMapping("/get-users-by-ids")
    public List<UserResponseDTO> getUsersByEmails(@RequestBody List<UUID> ids) {
        return userService.getUsersByIds(ids);
    }
    @PostMapping("/signup-user")
    public ResponseEntity<User> signupUser(@RequestBody User user){
        return ResponseEntity.ok(userService.signupUser(user));
    }


    @PostMapping("/signup")
    public ResponseEntity<JwtAuthenticationRequest> signup(@RequestBody SignUpRequest signUpRequest){

        return ResponseEntity.ok(authenticationService.signup(signUpRequest));

    }
    @PostMapping("/signin")
    public ResponseEntity<JwtAuthenticationRequest> signIn(@RequestBody SignInRequest signInRequest){

        return ResponseEntity.ok(authenticationService.signIn(signInRequest));

    }
    @PostMapping("/update-user/{id}")
    public ResponseEntity<User> updateUser(@PathVariable UUID id,@RequestBody UserRequest userRequest) throws IllegalAccessException {

        return ResponseEntity.ok(userService.updateUser(id,userRequest));

    }


//    @PostMapping("/google")
//    public ResponseEntity<ApiResponse> googleSignUp(@RequestBody TokenRequest request){
//        System.out.println(request);
//        System.out.println(googleClientId);
//        try{
//            GoogleIdTokenVerifier verifier=new GoogleIdTokenVerifier.Builder(
//                    new NetHttpTransport(),
//                    new GsonFactory()
//            ).setAudience(Collections.singletonList(googleClientId))
//                    .build();
//            GoogleIdToken idToken=verifier.verify(request.getCredential());
//            if(idToken!=null){
//                GoogleIdToken.Payload payload=idToken.getPayload();
//                String email=payload.getEmail();
//                String sub=payload.getSubject();
//                String firstName=(String) payload.get("given_name");
//                String lastName=(String) payload.get("family_name");
//                System.out.println(email+sub+firstName+lastName);
//                Optional<User> user=userRepository.findByEmail(email);
//                if(user.isEmpty()){
//                    SignUpRequest signUpRequest=new SignUpRequest();
//                    signUpRequest.setEmail(email);
//                    signUpRequest.setFirstName(firstName);
//                    signUpRequest.setLastName(lastName);
//                    signUpRequest.setPassword(sub);
//                    return ResponseEntity.ok(new ApiResponse("success",authenticationService.signup(signUpRequest)));
//                }else{
//                    SignInRequest signInRequest=new SignInRequest();
//                    signInRequest.setEmail(email);
//                    signInRequest.setPassword(sub);
//                    return ResponseEntity.ok(new ApiResponse("success",authenticationService.signIn(signInRequest)));
//                }
//            }else {
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                        .body(new ApiResponse("Invalid ID token.",HttpStatus.UNAUTHORIZED));
//            }
//
//        }catch (Exception e){
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new ApiResponse("Error verifying token: " + e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR));
//        }
//    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtAuthenticationRequest> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest){
        return ResponseEntity.ok(authenticationService.refreshToken(refreshTokenRequest));

    }


}
