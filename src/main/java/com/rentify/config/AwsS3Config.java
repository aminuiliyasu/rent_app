package com.rentify.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * Creates an S3Client when a bucket name is configured.
 * Credentials come from the default provider chain (ECS task role,
 * env vars AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY, profile, etc.).
 * Static access keys are not required.
 */
@Configuration
@ConditionalOnExpression("!'${app.aws.s3.bucket-name:}'.isBlank()")
public class AwsS3Config {

    private static final Logger log = LoggerFactory.getLogger(AwsS3Config.class);

    @Value("${app.aws.s3.region:us-east-1}")
    private String region;

    @Value("${app.aws.s3.bucket-name}")
    private String bucketName;

    @Bean
    public S3Client s3Client() {
        log.info("S3 enabled: bucket={}, region={} (credentials via DefaultCredentialsProvider)",
                bucketName, region);
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
