package com.interviewTrainer.userService;

import com.interviewTrainer.userService.entity.Role;
import com.interviewTrainer.userService.entity.User;
import com.interviewTrainer.userService.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication(scanBasePackages ="com.interviewTrainer.userService" )
@RequiredArgsConstructor
@EnableCaching
public class UserServiceApplication implements CommandLineRunner {

	private final UserRepository userRepository;
	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}
	@Override
	public void run(String... args) throws Exception {
		User adminAccount = userRepository.findByRole(Role.ADMIN);
		if (adminAccount == null) {
			User user = new User();
			user.setEmail("admin@gmail.com");
			user.setName("admin");
			user.setRole(Role.ADMIN);
			user.setPassword(new BCryptPasswordEncoder().encode("admin"));

			userRepository.save(user);
		}
	}
}
