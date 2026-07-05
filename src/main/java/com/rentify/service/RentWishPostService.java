package com.rentify.service;

import com.rentify.dto.request.CreateRentWishPostRequest;
import com.rentify.dto.response.RentWishPostResponse;
import com.rentify.model.RentWishPost;
import com.rentify.model.User;
import com.rentify.model.enums.DeliveryPreference;
import com.rentify.model.enums.DepositPreference;
import com.rentify.model.enums.RentWishRequestType;
import com.rentify.repository.RentWishPostRepository;
import com.rentify.repository.UserRepository;
import com.rentify.util.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RentWishPostService {

    private static final int MAX_VISIBILITY_HOURS = 24;

    @Autowired
    private RentWishPostRepository rentWishPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<RentWishPostResponse> listVisible(Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusHours(MAX_VISIBILITY_HOURS);
        Page<RentWishPost> raw = rentWishPostRepository.findByCreatedAtAfter(cutoff, pageable);
        List<RentWishPostResponse> content = raw.getContent().stream()
                .filter(post -> isStillVisible(post, now))
                .map(this::toResponse)
                .toList();
        return new PageImpl<>(content, pageable, content.size());
    }

    @Transactional
    public RentWishPostResponse create(CreateRentWishPostRequest request) {
        Long userId = CurrentUser.getCurrentUserId();
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RentWishPost post = new RentWishPost();
        post.setAuthor(author);
        RentWishRequestType requestType = parseRequestType(request.getRequestType());
        post.setRequestType(requestType);
        post.setTitle(request.getTitle().trim());
        post.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        post.setTimingNote(requestType == RentWishRequestType.WORKER ? trimToNull(request.getTimingNote()) : null);

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
        if (requestType == RentWishRequestType.ITEM) {
            post.setDeliveryPreference(parseDeliveryPreference(request.getDeliveryPreference()));
            post.setDepositPreference(parseDepositPreference(request.getDepositPreference()));
            post.setDepositNote(trimToNull(request.getDepositNote()));
        } else {
            post.setDeliveryPreference(null);
            post.setDepositPreference(null);
            post.setDepositNote(null);
        }
        post.setVisibilityHours(normalizeVisibilityHours(request.getVisibilityHours()));

        RentWishPost saved = rentWishPostRepository.save(post);
        return toResponse(saved);
    }

    public static int resolveVisibilityHours(RentWishPost post) {
        return normalizeVisibilityHours(post.getVisibilityHours());
    }

    public static boolean isStillVisible(RentWishPost post, LocalDateTime now) {
        return post.getCreatedAt().plusHours(resolveVisibilityHours(post)).isAfter(now);
    }

    private static int normalizeVisibilityHours(Integer raw) {
        if (raw != null && raw == 12) {
            return 12;
        }
        return 24;
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

    private RentWishRequestType parseRequestType(String raw) {
        if (raw == null || raw.isBlank()) {
            return RentWishRequestType.ITEM;
        }
        try {
            return RentWishRequestType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return RentWishRequestType.ITEM;
        }
    }

    private DeliveryPreference parseDeliveryPreference(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return DeliveryPreference.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private DepositPreference parseDepositPreference(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return DepositPreference.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private RentWishPostResponse toResponse(RentWishPost post) {
        int hours = resolveVisibilityHours(post);
        RentWishPostResponse response = new RentWishPostResponse();
        response.setId(post.getId());
        response.setRequestType(
                post.getRequestType() != null ? post.getRequestType().name() : RentWishRequestType.ITEM.name());
        response.setTitle(post.getTitle());
        response.setTimingNote(post.getTimingNote());
        response.setDescription(post.getDescription());
        response.setLocation(post.getLocation());
        response.setDistrict(post.getDistrict());
        response.setCity(post.getCity());
        response.setCountry(post.getCountry());
        response.setAuthorId(post.getAuthor().getId());
        response.setAuthorName(post.getAuthor().getName());
        response.setCreatedAt(post.getCreatedAt());
        response.setExpiresAt(post.getCreatedAt().plusHours(hours));
        response.setBudgetText(post.getBudgetText());
        response.setDeliveryPreference(
                post.getDeliveryPreference() != null ? post.getDeliveryPreference().name() : null);
        response.setDepositPreference(
                post.getDepositPreference() != null ? post.getDepositPreference().name() : null);
        response.setDepositNote(post.getDepositNote());
        response.setVisibilityHours(hours);
        return response;
    }
}
