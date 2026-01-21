package com.siteduyuru.kontrol;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.servis.KullaniciServisi;
import com.siteduyuru.servis.MesajServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalKontrolAdvice {

    @Autowired
    private MesajServisi mesajServisi;

    @Autowired
    private KullaniciServisi kullaniciServisi;

    @ModelAttribute("unreadMessageCount")
    public long getUnreadMessageCount(Authentication auth) {
        if (auth != null && auth.isAuthenticated()) {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (isAdmin) {
                return mesajServisi.adminOkunmamisSayisi();
            } else {
                Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
                if (k != null) {
                    return mesajServisi.okunmamisSayisi(k.getId());
                }
            }
        }
        return 0;
    }
}
