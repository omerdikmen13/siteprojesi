package com.siteduyuru.guvenlik;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.veritabani.KullaniciVeriDeposu;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;

@Service
public class KullaniciDetaylarServisi implements UserDetailsService {

        private final KullaniciVeriDeposu kullaniciVeriDeposu;

        public KullaniciDetaylarServisi(KullaniciVeriDeposu kullaniciVeriDeposu) {
                this.kullaniciVeriDeposu = kullaniciVeriDeposu;
        }

        @Override
        public UserDetails loadUserByUsername(String email)
                        throws UsernameNotFoundException {
                System.out.println("Giris denemesi yapiliyor: " + email);

                Kullanici kullanici = kullaniciVeriDeposu
                                .findByEmail(email)
                                .orElseThrow(() -> {
                                        System.out.println("HATA: Kullanici bulunamadi - " + email);
                                        return new UsernameNotFoundException(
                                                        "Kullanıcı bulunamadı: " + email);
                                });

                Set<GrantedAuthority> yetkiler = Collections.singleton(
                                new SimpleGrantedAuthority(
                                                "ROLE_" + kullanici.getRolu().name()));

                System.out.println("Kullanici bulundu: " + email + ", Rol: " + kullanici.getRolu().name());
                System.out.println("VERITABANINDAN ALINAN SIFRE HASH: " + kullanici.getSifre());

                return new User(
                                kullanici.getEmail(),
                                kullanici.getSifre(),
                                yetkiler);
        }
}
