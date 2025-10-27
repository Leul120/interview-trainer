package com.interviewTrainer.interviewSessionService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
@EnableAsync
@EnableJpaRepositories
@EnableCaching
public class InterviewSessionServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(InterviewSessionServiceApplication.class, args);
	}

}
