package de.bht.studybridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StudybridgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudybridgeApplication.class, args);
    }
}
