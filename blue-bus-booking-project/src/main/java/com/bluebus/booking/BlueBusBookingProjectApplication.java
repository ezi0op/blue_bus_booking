package com.bluebus.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class BlueBusBookingProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlueBusBookingProjectApplication.class, args);
	}

}
