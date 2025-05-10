package com.learnify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;


@SpringBootApplication
@ComponentScan(basePackages = "com.learnify") // Ensure correct package scanning
public class LearnifyApplication {
    public static void main(String[] args) {
        SpringApplication.run(LearnifyApplication.class, args);
    }
}
