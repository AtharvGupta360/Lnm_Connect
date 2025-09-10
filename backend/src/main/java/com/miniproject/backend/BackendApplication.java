package com.miniproject.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    @Order(org.springframework.core.Ordered.HIGHEST_PRECEDENCE)
    public jakarta.servlet.Filter corsFilter() {
        return new jakarta.servlet.Filter() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res, jakarta.servlet.FilterChain chain) throws java.io.IOException, jakarta.servlet.ServletException {
                jakarta.servlet.http.HttpServletResponse response = (jakarta.servlet.http.HttpServletResponse) res;
                response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
                response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
                response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept");
                response.setHeader("Access-Control-Allow-Credentials", "true");
                if ("OPTIONS".equalsIgnoreCase(((jakarta.servlet.http.HttpServletRequest) req).getMethod())) {
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_OK);
                } else {
                    chain.doFilter(req, res);
                }
            }
        };
    }
}
