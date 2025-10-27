package com.interviewTrainer.interviewSessionService.utils;

import com.interviewTrainer.interviewSessionService.requests.PaginationRequest;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class PaginationUtils {

    public static Pageable getPageable(PaginationRequest request) {
        int page = (request.getPage() != null) ? request.getPage() : 0;  // Ensures default page = 0
        int size = (request.getSize() != null) ? request.getSize() : 10;  // Ensures default size = 10

        Sort sort = Sort.unsorted();
        if (request.getSortField() != null && request.getDirection() != null) {
            sort = Sort.by(request.getDirection(), request.getSortField());
        }

        return PageRequest.of(page, size, sort);
    }
}