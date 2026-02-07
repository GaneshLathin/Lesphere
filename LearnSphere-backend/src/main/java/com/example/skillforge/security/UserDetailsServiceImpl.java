package com.example.skillforge.security;

import com.example.skillforge.model.entity.User;
import com.example.skillforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Check for block expiry
        if (user.isBlocked() && user.getBlockExpiry() != null && user.getBlockExpiry().isBefore(java.time.LocalDateTime.now())) {
            user.setBlocked(false);
            user.setBlockReason(null);
            user.setBlockExpiry(null);
            userRepository.save(user);
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getIsActive(), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                !user.isBlocked(), // accountNonLocked
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
