## Ne değişiyor

<!-- Bir iki cümle. Nedeni, nasılından önemli. -->

## Denetim

- [ ] `npx tsc --noEmit`
- [ ] `cargo clippy --workspace --all-targets -- -D warnings`
- [ ] `cargo test -p tlk-rpf-core` (gerçek dosyalarla, `testdata/` dolu)
- [ ] Bir biçime dokunduysam `cargo run -p tlk-rpf-core --example kirici` 0 çökme veriyor
- [ ] Kullanıcı dosyasına yazan yol yedek alıyor ve geçici dosya + atomik yer değiştirme kullanıyor

<!-- Yeni biçim? core/tests/gercek.rs içine gerçek dosyayı düzenleyip yeniden okuyan
     ve dosyanın geri kalanının değişmediğini doğrulayan bir test ekle. -->
