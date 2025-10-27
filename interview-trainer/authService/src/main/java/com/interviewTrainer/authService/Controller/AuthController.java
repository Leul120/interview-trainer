package com.interviewTrainer.authService.Controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.interviewTrainer.authService.openFeign.UserClient;
import com.interviewTrainer.authService.requests.JwtAuthenticationRequest;
import com.interviewTrainer.authService.requests.RefreshTokenRequest;
import com.interviewTrainer.authService.requests.SignInRequest;
import com.interviewTrainer.authService.requests.SignUpRequest;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserClient userClient;
    @Autowired
    private Cloudinary cloudinary;

    @GetMapping
    public ResponseEntity<String> get(){
        return ResponseEntity.ok("hello world!");
    }

    @PostMapping("/signup")
    public ResponseEntity<JwtAuthenticationRequest> signup(@RequestBody SignUpRequest signUpRequest){
        System.out.println(signUpRequest);
            return ResponseEntity.ok(userClient.signup(signUpRequest).getBody());

    }
    @PostMapping("/signin")
    public ResponseEntity<JwtAuthenticationRequest> signIn(@RequestBody SignInRequest signInRequest){
            System.out.println(signInRequest);
            return ResponseEntity.ok(userClient.signIn(signInRequest).getBody());

    }
    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestBody MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty or null");
        }

        try {
            // Upload the file to Cloudinary
            Map<?, ?> uploadedFile = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());

            // Retrieve the public ID of the uploaded file
            String publicId = (String) uploadedFile.get("public_id");

            // Generate the secure URL for the uploaded file
            String fileUrl = cloudinary.url().secure(true).generate(publicId);

            // Return the file URL in the response
            return ResponseEntity.ok(fileUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
        }
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
            return ResponseEntity.ok(userClient.refreshToken(refreshTokenRequest).getBody());

    }
}
