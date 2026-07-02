package com.rentify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@ConditionalOnExpression(
    "!'${app.aws.s3.bucket-name:}'.isBlank() && "
        + "(!'${app.aws.s3.access-key:}'.isBlank() || !'${AWS_ACCESS_KEY_ID:}'.isBlank())")
public class AwsS3Config {

    @Value("${app.aws.s3.region:us-east-1}")
    private String region;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
