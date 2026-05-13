package com.rentify.service;

import com.rentify.dto.request.CreateRentWishPostRequest;
import com.rentify.dto.response.RentWishPostResponse;
import com.rentify.model.RentWishPost;
import com.rentify.model.User;
import com.rentify.model.enums.DeliveryPreference;
import com.rentify.repository.RentWishPostRepository;
import com.rentify.repository.UserRepository;
import com.rentify.util.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RentWishPostService {

    private static final int VISIBILITY_HOURS = 24;

    @Autowired
    private RentWishPostRepository rentWishPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<RentWishPostResponse> listVisible(Pageable pageable) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(VISIBILITY_HOURS);
        return rentWishPostRepository.findByCreatedAtAfter(cutoff, pageable).map(this::toResponse);
    }

    @Transactional
    public RentWishPostResponse create(CreateRentWishPostRequest request) {
        Long userId = CurrentUser.getCurrentUserId();
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RentWishPost post = new RentWishPost();
        post.setAuthor(author);
        post.setTitle(request.getTitle().trim());
        post.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        String district = trimToNull(request.getDistrict());
        String city = trimToNull(request.getCity());
        String country = trimToNull(request.getCountry());
        post.setDistrict(district);
        post.setCity(city);
        post.setCountry(country);

        String composedLocation = composeLocation(district, city, country);
        String legacyLocation = trimToNull(request.getLocation());
        post.setLocation(composedLocation != null ? composedLocation : legacyLocation);

        post.setBudgetText(trimToNull(request.getBudgetText()));
        post.setDeliveryPreference(parseDeliveryPreference(request.getDeliveryPreference()));

        RentWishPost saved = rentWishPostRepository.save(post);
        return toResponse(saved);
    }

    private static String trimToNull(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String composeLocation(String district, String city, String country) {
        StringBuilder out = new StringBuilder();
        if (district != null) out.append(district);
        if (city != null) {
            if (out.length() > 0) out.append(", ");
            out.append(city);
        }
        if (country != null) {
            if (out.length() > 0) out.append(", ");
            out.append(country);
        }
        return out.length() == 0 ? null : out.toString();
    }

    private DeliveryPreference parseDeliveryPreference(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return DeliveryPreference.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private RentWishPostResponse toResponse(RentWishPost post) {
        return RentWishPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .description(post.getDescription())
                .location(post.getLocation())
                .district(post.getDistrict())
                .city(post.getCity())
                .country(post.getCountry())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getName())
                .createdAt(post.getCreatedAt())
                .expiresAt(post.getCreatedAt().plusHours(VISIBILITY_HOURS))
                .budgetText(post.getBudgetText())
                .deliveryPreference(post.getDeliveryPreference() != null ? post.getDeliveryPreference().name() : null)
                .build();
    }
}
