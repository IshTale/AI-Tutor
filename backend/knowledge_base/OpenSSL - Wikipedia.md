5/18/26, 3:22 PM OpenSSL - Wikipedia

# **OpenSSL**


**OpenSSL** is an [open-source](https://en.wikipedia.org/wiki/Open-source_software) software library and
command-line toolkit that implements the [Transport](https://en.wikipedia.org/wiki/Transport_Layer_Security)
[Layer Security](https://en.wikipedia.org/wiki/Transport_Layer_Security) (TLS) protocol and a range of
cryptographic functions. It is used by Internet servers,
operating systems, application frameworks,
programming-language runtimes, and embedded
software to provide encrypted communications and
certificate-based authentication ~~.~~ [[3][4][5]]





[The project began in 1998 as a continuation of SSLeay,](https://en.wikipedia.org/wiki/SSLeay)
an earlier SSL implementation written by Eric A. Young
and Tim Hudson. OpenSSL became one of the mostused TLS libraries on the Internet, particularly for
[HTTPS. Its security, funding, and governance came](https://en.wikipedia.org/wiki/HTTPS)
under public scrutiny after the 2014 [Heartbleed](https://en.wikipedia.org/wiki/Heartbleed)
vulnerability, which prompted emergency patching
across the Internet, new funding for critical open-source
infrastructure, and forks including [LibreSSL](https://en.wikipedia.org/wiki/LibreSSL) and
[BoringSSL.](https://en.wikipedia.org/wiki/BoringSSL) [[6][4][7][8]]


OpenSSL 1.1.1 added support for [TLS 1.3](https://en.wikipedia.org/wiki/TLS_1.3) and was a
long-term-support release. [[9][10]] OpenSSL 3.0, released
in 2021, introduced a provider architecture, restored
FIPS support through a new FIPS provider, and
changed the project license to the Apache License 2.0 ~~.~~ [[3]]

Later releases added support for [QUIC](https://en.wikipedia.org/wiki/QUIC) and postquantum cryptography. [[11][1]] OpenSSL 4.0, released in
2026, removed several deprecated features and
introduced further incompatible changes ~~.~~ [[1]]


Governance changed in 2024, when the OpenSSL
Management Committee was dissolved and
responsibilities were divided between the OpenSSL
Foundation and the OpenSSL Corporation. [[12]] The
codebase has also influenced derivative libraries,
including LibreSSL, BoringSSL, AWS-LC, and QuicTLS.







https://en.wikipedia.org/wiki/OpenSSL 1/12


5/18/26, 3:22 PM OpenSSL - Wikipedia

## **History**

### **Origins in SSLeay**


OpenSSL originated in SSLeay, an open-source implementation of SSL developed by Eric A. Young
and Tim Hudson in the 1990s. SSLeay development effectively ended when Young and Hudson joined
[RSA Security.](https://en.wikipedia.org/wiki/RSA_Security) [[6]] In late 1998, Mark Cox, Ralf Engelschall, Stephen Henson, [Ben Laurie, and Paul](https://en.wikipedia.org/wiki/Ben_Laurie)
Sutton formed the initial OpenSSL project team to continue development of the codebase. [[6][13]] The
first OpenSSL release, version 0.9.1, was announced in December 1998. [[13]] In a twentieth-anniversary
retrospective, Cox wrote that all of the founding team except Henson were core developers of the
[Apache HTTP Server](https://en.wikipedia.org/wiki/Apache_HTTP_Server) ~~.~~ [[6]]

### **Early development and adoption**


During the 2000s, OpenSSL was deployed across Unix-like operating systems, web servers, mail
servers, VPN software, and application runtimes. Its permissive licensing allowed use in both opensource and proprietary software, and the `openssl` command-line program became a common tool for
generating keys, creating certificate-signing requests, inspecting certificates, testing TLS endpoints,
and performing other cryptographic operations. [[14][15]]


OpenSSL was also embedded as infrastructure inside larger systems. This deployment pattern meant
that defects in the library could affect many unrelated applications at once, while major API or ABI
changes could require coordinated work by operating-system distributions, language runtimes, and
application maintainers. [[5]]

### **Heartbleed and post-2014 reform**


On April 7, 2014, OpenSSL disclosed Heartbleed, a bounds-checking error in the implementation of
the TLS heartbeat extension. The bug was assigned the identifier CVE-2014-0160, affected OpenSSL
1.0.1 through 1.0.1f, and allowed an attacker to read up to 64 KB of memory from a vulnerable process
per request. [[16][17][18]] Because OpenSSL was deployed in HTTPS servers and other TLS-enabled
software, Heartbleed triggered an Internet-wide remediation effort involving patching, certificate
replacement, key rotation, and incident response. [[19][20][21]] Cryptographer Bruce Schneier described
the disclosure as catastrophic, writing that on a scale of one to ten "this is an 11." [[8]] A challenge run by
Cloudflare in the days after disclosure produced four independent extractions of TLS private keys
from a vulnerable test server, confirming that Heartbleed could expose long-term secret material
rather than only session data ~~.~~ [[22]]


Heartbleed also reframed the public discussion of open-source infrastructure funding. The disclosure
[followed several months of heightened attention to Internet encryption after Snowden-era reporting](https://en.wikipedia.org/wiki/Edward_Snowden)
on intelligence-service interference with cryptographic standards. [[23]] _Wired_ reported that, at the time
of disclosure, OpenSSL was maintained by a small team and had only one full-time developer ~~.~~ [[4]] Steve
Marquess of the OpenSSL Software Foundation wrote that pre-Heartbleed donations to the
foundation had averaged about US$2,000 per year, an amount inadequate to support full-time


https://en.wikipedia.org/wiki/OpenSSL 2/12


5/18/26, 3:22 PM OpenSSL - Wikipedia

engineering on a project of OpenSSL's scope ~~.~~ [[24]] Shortly after the disclosure, the [Linux Foundation](https://en.wikipedia.org/wiki/Linux_Foundation)
announced the Core Infrastructure Initiative, backed by large technology companies, to fund OpenSSL
and other open-source components ~~.~~ [[4][7]]


The incident prompted alternative approaches to OpenSSL maintenance and API design. [OpenBSD](https://en.wikipedia.org/wiki/OpenBSD)
[developers created LibreSSL as a cleaned-up fork of OpenSSL, and Google announced BoringSSL for](https://en.wikipedia.org/wiki/Google)
its own products and infrastructure later in 2014 ~~.~~ [[25][26]]

### **Modernization and OpenSSL 1.1.x**


The OpenSSL 1.1.x series made many internal structures opaque, moved applications toward accessor
functions, and reduced reliance on direct access to implementation details. OpenSSL 1.1.1, released in
[September 2018, added support for TLS 1.3, which the Internet Engineering Task Force had published](https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force)
[as RFC](https://en.wikipedia.org/wiki/RFC_(identifier)) [8446 (https://www.rfc-editor.org/rfc/rfc8446)](https://www.rfc-editor.org/rfc/rfc8446) ~~.~~ [[9][10]] OpenSSL 1.1.1 was a long-term-support
release and was supported until September 2023. [[27]]


The shift to opaque data structures and stricter interfaces improved maintainability but created
compatibility work for applications that had used OpenSSL internals directly. The same pattern of
architectural change accompanied by downstream transition costs continued in the OpenSSL 3.x
series.

### **OpenSSL 3.x**


Public planning for OpenSSL 3.0 began several years before its release; a 2019 status update from the
project described the release as one of the largest engineering efforts in OpenSSL's history and
outlined the goals of provider-based algorithm loading, FIPS support, and an updated license. [[28]]

OpenSSL 3.0 was released on September 7, 2021. It was the first OpenSSL release under the Apache
License 2.0 and introduced a provider architecture that allowed cryptographic algorithm
implementations to be loaded from providers rather than being only built into the core library. [[3]] The
OpenSSL project described 3.0 as a release that was not fully backward compatible with OpenSSL
1.1.1, although most applications that worked with 1.1.1 were expected to work after recompilation,
possibly with deprecation warnings. [[3]]


OpenSSL 3.0 also introduced the new FIPS provider. The project submitted the OpenSSL 3.0 FIPS
module for FIPS 140-2 validation in 2021. [[29]] In 2025, OpenSSL announced that version 3.1.2 of the
OpenSSL FIPS Provider had achieved FIPS 140-3 validation, with certificate #4985 valid until March
10, 2030. [[30]]


OpenSSL 3.5, released in April 2025, was designated as the next long-term-support release after 3.0.
The project said 3.5 would be supported until April 8, 2030, while OpenSSL 3.0 would receive full
support until September 7, 2025 and security fixes until September 7, 2026. [[11]] OpenSSL 3.5 added
support for post-quantum cryptographic algorithms and server-side QUIC ~~.~~ [[31]]


https://en.wikipedia.org/wiki/OpenSSL 3/12


5/18/26, 3:22 PM OpenSSL - Wikipedia
### **OpenSSL 4.x**


OpenSSL 4.0 was released on April 14, 2026. The project described it as a feature release with
potentially incompatible changes ~~.~~ [[1]] The release removed or changed several deprecated behaviors
and added new cryptographic and protocol features ~~.~~ [[1]] Under the release strategy in force at the time,
non-LTS releases after 3.5 were supported for a minimum of 13 months, while new LTS releases were
to be designated every two years and supported for at least five years ~~.~~ [[27]]

## **Architecture and components**

### **libcrypto and libssl**


OpenSSL is built around two libraries: **libcrypto** and **libssl** . Libcrypto provides cryptographic
primitives and supporting functions, including message digests, symmetric ciphers, public-key
cryptography, random-number generation, certificate parsing, and encoding utilities. Libssl
implements the SSL and TLS protocol layers and uses libcrypto for the underlying cryptographic
operations. [[14][15]]


Libcrypto exposes input and output through the BIO abstraction, which presents a uniform interface
to sockets, files, memory buffers, and filter chains such as base64 or digest computation. [[14][15]]

Asymmetric keys, certificates, and algorithm parameters are wrapped through the EVP family of highlevel interfaces, which the project recommends in preference to the older algorithm-specific
functions. [[32]]


Applications can use OpenSSL directly through its C API or indirectly through bindings in other
programming languages and frameworks. Higher-level libraries, web servers, mail servers, VPNs, and
application runtimes use OpenSSL as their TLS or cryptographic backend. [[14][5]]

### **Command-line utility**


The `openssl` command-line program exposes library functions through a shell interface. It can
generate private keys, create and inspect certificates, produce certificate-signing requests, test TLS
handshakes, compute digests, encrypt and decrypt data, and perform certificate-authority
functions. [[14][15]] The `s_client` and `s_server` subcommands act as minimal client and server
implementations and are commonly used to debug TLS endpoints ~~.~~ [[14]] Production applications
normally use the OpenSSL libraries directly rather than invoking the command-line utility.

### **Provider architecture**

OpenSSL 3.0 introduced a provider architecture for cryptographic algorithm implementations.
Providers can supply implementations of algorithms and can be selected by applications or
configuration. The architecture was intended to make algorithm implementations more modular and
to support FIPS-validated implementations, legacy algorithms, and third-party providers ~~.~~ [[3][32]]

Providers replaced the older ENGINE interface, which had served the same role of allowing
alternative cryptographic backends, including hardware accelerators, in pre-3.0 releases. [[32]]


https://en.wikipedia.org/wiki/OpenSSL 4/12


5/18/26, 3:22 PM OpenSSL - Wikipedia

The provider model also changed the way applications interact with some cryptographic functionality.
The OpenSSL project advised developers to migrate away from deprecated low-level APIs and toward
higher-level interfaces such as the EVP APIs where possible. [[3][32]]

### **Algorithms**


OpenSSL supports a range of cryptographic algorithms across several categories:


**[Ciphers](https://en.wikipedia.org/wiki/Cipher)**

[AES, Blowfsh, Camellia,](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) [ChaCha20, Poly1305,](https://en.wikipedia.org/wiki/ChaCha20) [SEED, CAST-128,](https://en.wikipedia.org/wiki/SEED) [DES,](https://en.wikipedia.org/wiki/Data_Encryption_Standard) [IDEA,](https://en.wikipedia.org/wiki/International_Data_Encryption_Algorithm) [RC2,](https://en.wikipedia.org/wiki/RC2) [RC4,](https://en.wikipedia.org/wiki/RC4)
[RC5, Triple DES, GOST 28147-89,](https://en.wikipedia.org/wiki/RC5) [[33]] [and SM4.](https://en.wikipedia.org/wiki/SM4_(cipher))
**[Cryptographic hash functions](https://en.wikipedia.org/wiki/Cryptographic_hash_function)**

[MD5,](https://en.wikipedia.org/wiki/MD5) [MD4, MD2, SHA-1, SHA-2, SHA-3, RIPEMD-160, MDC-2,](https://en.wikipedia.org/wiki/MD4) [GOST R 34.11-94,](https://en.wikipedia.org/wiki/GOST_(hash_function)) [[33]] [BLAKE2,](https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2)
[Whirlpool, and SM3.](https://en.wikipedia.org/wiki/Whirlpool_(cryptography))
**[Public-key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography)**

[RSA,](https://en.wikipedia.org/wiki/RSA_(algorithm)) [DSA,](https://en.wikipedia.org/wiki/Digital_Signature_Algorithm) [Diffe–Hellman key exchange,](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange) [elliptic-curve variants of these (ECDSA, ECDH), and](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography)
[Ed25519 and X25519 from the Curve25519 family](https://en.wikipedia.org/wiki/Ed25519) ~~.~~ [[14][5]]
**Post-quantum cryptography**

From OpenSSL 3.5, the project added support for post-quantum key encapsulation and
[signature algorithms standardized by NIST, including ML-KEM and ML-DSA.](https://en.wikipedia.org/wiki/National_Institute_of_Standards_and_Technology) [[31]]

### **FIPS support**

[FIPS 140 is a U.S. government standard and validation program for cryptographic modules. OpenSSL](https://en.wikipedia.org/wiki/FIPS_140)
has had several FIPS-related modules and validations over time. OpenSSL 1.0.2 supported use of the
OpenSSL FIPS Object Module 2.0, while OpenSSL 3.x replaced the older model with the FIPS
provider architecture ~~.~~ [[29][30]]


The OpenSSL 3.0 FIPS Provider was submitted for FIPS 140-2 validation shortly after the OpenSSL
3.0 release ~~.~~ [[29]] In March 2025, OpenSSL announced that the OpenSSL 3.1.2 FIPS Provider had
achieved FIPS 140-3 validation under certificate #4985 ~~.~~ [[30]]

## **Governance and funding**


For much of its early history, OpenSSL was maintained by a small group of volunteer and part-time
developers. The project's limited resources became a public issue after Heartbleed, when coverage of
the incident drew attention to the dependence of commercial and public infrastructure on lightly
funded open-source components ~~.~~ [[4][7][24]]


OpenSSL was historically represented by the OpenSSL Software Foundation for legal and community
matters and by OpenSSL Software Services for commercial support. In 2024, the project announced a
new governance framework in which the OpenSSL Management Committee was dissolved and
responsibilities were divided between two co-equal entities, the OpenSSL Foundation and the
OpenSSL Corporation ~~.~~ [[12]] Each organization elected a ten-member board of directors; the project
described the Foundation as focused on non-commercial communities and the Corporation as focused
on commercial communities ~~.~~ [[12]]


https://en.wikipedia.org/wiki/OpenSSL 5/12


5/18/26, 3:22 PM OpenSSL - Wikipedia

The OpenSSL Corporation's 2025 annual report stated that 2025 revenue came from commercial
support contracts and that the organization ended the year close to break-even under a conservative
financial model. [[34]] The Foundation also began publishing annual reports as part of a transparency
effort after the governance changes ~~.~~ [[35]]

## **Release model**


OpenSSL follows a scheduled release strategy. Under the strategy adopted from OpenSSL 3.5 onward,
the project planned new releases every April and October, a new long-term-support release every two
years, and, beginning with OpenSSL 5.0, a major release every two years. [[27]] LTS releases are
supported for at least five years, with the final year limited to security fixes; non-LTS releases after 3.5
are supported for at least 13 months ~~.~~ [[27]]


Selected major OpenSSL release lines

















|Version<br>line|First release|Support status or end<br>date|Notes|
|---|---|---|---|
|**0.9.x**|1998–2005|End of life|Early OpenSSL releases derived from SSLeay;<br>founding of the project.|
|**1.0.1**|March 14, 2012|December 31, 2016|Added TLS 1.1 and TLS 1.2; affected by Heartbleed in<br>versions 1.0.1–1.0.1f.|
|**1.0.2**|January 22,<br>2015|December 31, 2019|Long-lived pre-1.1 line; used by many distributions<br>and vendors.|
|**1.1.1 LTS**|September 11,<br>2018|September 11, 2023|Added TLS 1.3 support.[9]|
|**3.0 LTS**|September 7,<br>2021|Security fxes until<br>September 7, 2026|Provider architecture, Apache License 2.0, new FIPS<br>provider~~.~~[3][11]|
|**3.5 LTS**|April 8, 2025|April 8, 2030|LTS line with PQC and QUIC-related additions~~.~~[11][31]|
|**4.0**|April 14, 2026|Non-LTS release|Feature release with incompatible changes and<br>removal of deprecated behaviors~~.~~[1]|

## **Security history**

OpenSSL's security history reflects the library's deployment scale. The project maintains a security
policy and classifies vulnerabilities by severity, taking into account affected versions, defaults, use
cases, and exploitability. [[36]] Not every OpenSSL vulnerability has had the same public impact; the
incidents below involved broad deployment, private-key or plaintext exposure, or systemic
consequences for the wider Internet.

### **Debian predictable random number generator**


In 2008, Debian disclosed that a Debian-specific patch to OpenSSL had weakened the randomnumber generator used by Debian and Debian-derived systems. The change, introduced in 2006,
reduced the number of possible keys that could be generated, affecting SSH, TLS certificates, and
other cryptographic material produced on vulnerable systems ~~.~~ [[37]] The defect was not in upstream


https://en.wikipedia.org/wiki/OpenSSL 6/12


5/18/26, 3:22 PM OpenSSL - Wikipedia

OpenSSL, but the incident illustrated how downstream changes to cryptographic libraries can have
severe security consequences. OpenSSL later replaced its earlier entropy-handling code with a
[deterministic random bit generator (DRBG) consistent with NIST guidance.](https://en.wikipedia.org/wiki/NIST) [[14]]

### **Heartbleed**


Heartbleed is the most prominent OpenSSL vulnerability by public impact. It was caused by a missing
bounds check in the TLS heartbeat implementation and allowed attackers to read memory from
vulnerable servers and clients. [[16][17]] At disclosure, Netcraft estimated that about half a million trusted
HTTPS servers were vulnerable ~~.~~ [[19]] Cloudflare's public challenge demonstrated that the bug could be
used to extract TLS private keys, not only session data. [[22]] Remediation included upgrading OpenSSL,
restarting affected services, revoking and replacing certificates, and rotating potentially exposed
credentials ~~.~~ [[20][21]]

### **Other major vulnerabilities**

OpenSSL has disclosed many vulnerabilities besides Heartbleed; most have been addressed through
the project's security-advisory process ~~.~~ [[38]] A 2003 issue in OpenSSL 0.9.6k allowed certain
[malformed ASN.1 sequences to trigger excessive recursion that could crash a vulnerable process.](https://en.wikipedia.org/wiki/ASN.1) [[38]]

[An OCSP-stapling parsing flaw disclosed in 2011 (CVE-2011-0014 (https://nvd.nist.gov/vuln/detail/C](https://en.wikipedia.org/wiki/CVE_(identifier))
[VE-2011-0014)) affected OpenSSL 0.9.8h–0.9.8q and 1.0.0–1.0.0c and could be used either as a](https://nvd.nist.gov/vuln/detail/CVE-2011-0014)
[denial-of-service vector or, depending on the calling application, to read adjacent memory](https://en.wikipedia.org/wiki/Denial-of-service_attack) ~~.~~ [[39]] An
[ASN.1 BIO heap-overflow vulnerability disclosed in April 2012 (CVE-2012-2110 (https://nvd.nist.gov/](https://en.wikipedia.org/wiki/CVE_(identifier))
[vuln/detail/CVE-2012-2110)) affected applications that used the ASN.1 read functions on untrusted](https://nvd.nist.gov/vuln/detail/CVE-2012-2110)
[DER input](https://en.wikipedia.org/wiki/Distinguished_Encoding_Rules) ~~.~~ [[40]] [In February 2013, Royal Holloway researchers Nadhem AlFardan and Kenny Paterson](https://en.wikipedia.org/wiki/Royal_Holloway,_University_of_London)
[disclosed the "Lucky Thirteen attack" (CVE-2013-0169 (https://nvd.nist.gov/vuln/detail/CVE-2013-0](https://en.wikipedia.org/wiki/Lucky_Thirteen_attack)
[169)), a timing attack against CBC-mode cipher suites in SSL, TLS, and DTLS that affected OpenSSL](https://nvd.nist.gov/vuln/detail/CVE-2013-0169)
among other implementations. [[41]] In June 2014, OpenSSL fixed a ChangeCipherSpec injection
[vulnerability (CVE-2014-0224 (https://nvd.nist.gov/vuln/detail/CVE-2014-0224)) that could allow a](https://en.wikipedia.org/wiki/CVE_(identifier))
[man-in-the-middle attack in limited circumstances when both client and server were vulnerable.](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) [[42]]

[In March 2015, OpenSSL fixed a denial-of-service vulnerability (CVE-2015-0291 (https://nvd.nist.go](https://en.wikipedia.org/wiki/CVE_(identifier))
[v/vuln/detail/CVE-2015-0291)) caused by handling of the](https://nvd.nist.gov/vuln/detail/CVE-2015-0291) `signature_algorithms` extension in
`ClientHello` during renegotiation ~~.~~ [[43]] In 2016, OpenSSL fixed a high-severity issue involving
[Diffie–Hellman small subgroups](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange) [(CVE-2016-0701 (https://nvd.nist.gov/vuln/detail/CVE-2016-070](https://en.wikipedia.org/wiki/CVE_(identifier))
[1)) that could permit key recovery in particular configurations.](https://nvd.nist.gov/vuln/detail/CVE-2016-0701) [[44]]

## **Forks and derivatives**


OpenSSL's role as a general-purpose TLS and cryptography library has produced several forks and
derivative projects. These were generally created to meet different security, governance, API-stability,
or product-integration requirements rather than to replace OpenSSL outright ~~.~~ [[5]]

### **Agglomerated SSL**


https://en.wikipedia.org/wiki/OpenSSL 7/12


5/18/26, 3:22 PM OpenSSL - Wikipedia

Agglomerated SSL, or assl, was an OpenBSD-related wrapper project created by Marco Peereboom to
provide a simpler interface on top of OpenSSL's API. It was later superseded by the LibreSSL effort
and is no longer central to the OpenSSL ecosystem ~~.~~ [[45]]

### **LibreSSL**


In April 2014, after Heartbleed, members of the OpenBSD project forked OpenSSL 1.0.1g to create
LibreSSL. [[25]] OpenBSD developers said the fork was motivated by auditability, removal of obsolete
code, safer defaults, and a desire to simplify the codebase. Early reporting described the project as a
cleanup of OpenSSL, including removal of large amounts of unused or legacy code ~~.~~ [[46]] LibreSSL
became the TLS library in OpenBSD and was later made available as LibreSSL Portable for other
operating systems.

### **BoringSSL**


In June 2014, Google announced BoringSSL, another OpenSSL-derived library ~~.~~ [[26]] Unlike OpenSSL,
BoringSSL is not intended to provide a stable general-purpose API for third-party operating-system
[distributions. It is developed for Google's own products and infrastructure, including Chromium and](https://en.wikipedia.org/wiki/Chromium_(web_browser))
[Android-related uses. Google said it expected to continue exchanging fixes with OpenSSL and](https://en.wikipedia.org/wiki/Android_(operating_system))
LibreSSL where appropriate. [[47]]

### **AWS-LC**


[AWS-LC is a general-purpose cryptographic library maintained by Amazon Web Services. It is based](https://en.wikipedia.org/wiki/Amazon_Web_Services)
on code from OpenSSL and BoringSSL and is used in AWS cryptographic software ~~.~~ [[48]] The project
reflects a pattern in which large infrastructure providers maintain TLS and cryptographic libraries
adapted to their own platform, performance, FIPS, and operational requirements.

### **QuicTLS**


QuicTLS is an OpenSSL-derived fork created to provide QUIC-related TLS APIs before comparable
support was available in OpenSSL releases ~~.~~ [[49]] It was used by some projects that wanted OpenSSL
compatibility together with the QUIC APIs needed for HTTP/3 development. OpenSSL later added
QUIC functionality in the 3.x series, including client-side QUIC in OpenSSL 3.2 and additional QUIC
support in later releases. [[31]]

## **Compatibility and criticism**


OpenSSL's API history, release cadence, and role as a dependency for many unrelated applications
have made major version transitions difficult. Compatibility concerns appeared during the move to
OpenSSL 1.1.x, the OpenSSL 3.0 provider architecture, and later QUIC-related API work ~~.~~ [[3][50]]


https://en.wikipedia.org/wiki/OpenSSL 8/12


5/18/26, 3:22 PM OpenSSL - Wikipedia
### **API and ABI compatibility**


OpenSSL has not guaranteed source or binary compatibility across all major versions. The 1.1.x series
made many structures opaque and required applications to use accessor functions rather than direct
structure access. OpenSSL 3.0 introduced provider-based algorithm loading, a new FIPS model, and
deprecation of many older APIs ~~.~~ [[3][32]] These changes were intended to improve maintainability,
extensibility, and compliance support; they also required software maintainers and operating-system
vendors to update dependent packages.

### **OpenSSL 3.0 transition**


The OpenSSL 3.0 transition combined a new provider architecture, relicensing under Apache-2.0, and
[a new FIPS provider. Red Hat described the work of bringing OpenSSL 3.0 into Fedora and Red Hat](https://en.wikipedia.org/wiki/Red_Hat)
[Enterprise Linux](https://en.wikipedia.org/wiki/Red_Hat_Enterprise_Linux) as a substantial transition involving rebuilds, compatibility patches, and
adjustments by dependent packages. [[50]] Some users and downstream projects reported performance
regressions or compatibility problems after moving from OpenSSL 1.1.1 to OpenSSL 3.x, particularly
in workloads involving repeated parsing, key loading, or provider-related operations ~~.~~ [[3]]

### **QUIC support**


OpenSSL's handling of QUIC support became a recurring criticism among HTTP/3 and QUIC
implementers. QUIC requires TLS library support for functions that differ from conventional TLSover-TCP use. BoringSSL and other libraries added QUIC-related APIs earlier, while OpenSSL delayed
adoption of the commonly used API and later developed its own approach ~~.~~ [[51][52]] The delay
contributed to the use of QuicTLS by projects that wanted OpenSSL compatibility together with QUIC
APIs. [[49]]

## **Licensing**


OpenSSL releases before 3.0 are covered by the dual OpenSSL and SSLeay licenses ~~.~~ [[2]] The older
OpenSSL license included advertising-clause-style language and was incompatible with the [GNU](https://en.wikipedia.org/wiki/GNU_General_Public_License)
[General Public License without an exception, which led some GPL-licensed projects either to add an](https://en.wikipedia.org/wiki/GNU_General_Public_License)
explicit OpenSSL exception or to use alternative TLS libraries such as [GnuTLS](https://en.wikipedia.org/wiki/GnuTLS) or [Network Security](https://en.wikipedia.org/wiki/Network_Security_Services)
[Services](https://en.wikipedia.org/wiki/Network_Security_Services) ~~.~~ [[53]]


In 2015, the project announced a relicensing effort that required most contributors to sign contributor
license agreements. The relicensing process was completed before the OpenSSL 3.0 release, and
OpenSSL 3.0 and later releases are licensed under the Apache License 2.0 ~~.~~ [[54][3][2]]

## **See also**



[Comparison of cryptography libraries](https://en.wikipedia.org/wiki/Comparison_of_cryptography_libraries)
[Comparison of TLS implementations](https://en.wikipedia.org/wiki/Comparison_of_TLS_implementations)
[GnuTLS](https://en.wikipedia.org/wiki/GnuTLS)





https://en.wikipedia.org/wiki/OpenSSL 9/12


5/18/26, 3:22 PM OpenSSL - Wikipedia


[Network Security Services](https://en.wikipedia.org/wiki/Network_Security_Services)
[wolfSSL](https://en.wikipedia.org/wiki/WolfSSL)

## **References**


[1. "OpenSSL 4.0 Final Release - Live" (https://openssl-library.org/post/2026-04-14-openssl-40-fnal-r](https://openssl-library.org/post/2026-04-14-openssl-40-final-release/)

[elease/). OpenSSL Library. April 14, 2026. Retrieved May 15, 2026.](https://openssl-library.org/post/2026-04-14-openssl-40-final-release/)
[2. "License" (https://openssl-library.org/source/license/). OpenSSL Library. Retrieved May 15, 2026.](https://openssl-library.org/source/license/)
[3. Caswell, Matt (September 7, 2021). "OpenSSL 3.0 has been released!" (https://openssl-library.org/](https://openssl-library.org/post/2021-09-06-openssl3.final/)

[post/2021-09-06-openssl3.fnal/). OpenSSL Library. Retrieved May 15, 2026.](https://openssl-library.org/post/2021-09-06-openssl3.final/)
[4. Finley, Klint (April 24, 2014). "Google, Facebook, and Microsoft Team Up to Stop Another](https://www.wired.com/2014/04/cii/)

[Heartbleed" (https://www.wired.com/2014/04/cii/).](https://www.wired.com/2014/04/cii/) _Wired_ . Retrieved May 15, 2026.
5. Ristić, Ivan (2014). _Bulletproof SSL and TLS_ [. Feisty Duck. ISBN](https://en.wikipedia.org/wiki/ISBN_(identifier)) [978-1-907117-04-6.](https://en.wikipedia.org/wiki/Special:BookSources/978-1-907117-04-6)
[6. Cox, Mark (December 20, 2018). "Celebrating 20 years of OpenSSL" (https://openssl-library.org/p](https://openssl-library.org/post/2018-12-20-20years/index.html)

[ost/2018-12-20-20years/index.html). OpenSSL Library. Retrieved May 15, 2026.](https://openssl-library.org/post/2018-12-20-20years/index.html)
[7. Goodin, Dan (April 24, 2014). "Tech giants, chastened by Heartbleed, fnally agree to fund](https://arstechnica.com/information-technology/2014/04/tech-giants-chastened-by-heartbleed-finally-agree-to-fund-openssl/)

[OpenSSL" (https://arstechnica.com/information-technology/2014/04/tech-giants-chastened-by-hea](https://arstechnica.com/information-technology/2014/04/tech-giants-chastened-by-heartbleed-finally-agree-to-fund-openssl/)
[rtbleed-fnally-agree-to-fund-openssl/).](https://arstechnica.com/information-technology/2014/04/tech-giants-chastened-by-heartbleed-finally-agree-to-fund-openssl/) _Ars Technica_ . Retrieved May 15, 2026.
[8. Schneier, Bruce (April 9, 2014). "Heartbleed" (https://www.schneier.com/blog/archives/2014/04/he](https://www.schneier.com/blog/archives/2014/04/heartbleed.html)

[artbleed.html).](https://www.schneier.com/blog/archives/2014/04/heartbleed.html) _Schneier on Security_ . Retrieved May 15, 2026.
[9. Kovacs, Eduard (September 11, 2018). "OpenSSL 1.1.1 Released with TLS 1.3, Security](https://www.securityweek.com/openssl-111-released-tls-13-security-improvements/)

[Improvements" (https://www.securityweek.com/openssl-111-released-tls-13-security-improvement](https://www.securityweek.com/openssl-111-released-tls-13-security-improvements/)
[s/).](https://www.securityweek.com/openssl-111-released-tls-13-security-improvements/) _SecurityWeek_ . Retrieved May 15, 2026.
10. Rescorla, Eric (August 2018). _[The Transport Layer Security (TLS) Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc8446)_ (https://ww

[w.rfc-editor.org/rfc/rfc8446).](https://www.rfc-editor.org/rfc/rfc8446) [Internet Engineering Task Force. doi:10.17487/RFC8446 (https://doi.o](https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force)
[rg/10.17487%2FRFC8446).](https://doi.org/10.17487%2FRFC8446) [RFC](https://en.wikipedia.org/wiki/Request_for_Comments) [8446 (https://datatracker.ietf.org/doc/html/rfc8446). Retrieved](https://datatracker.ietf.org/doc/html/rfc8446)
May 15, 2026.
[11. "OpenSSL 3.5 will be the next long term stable (LTS) release" (https://openssl-library.org/post/202](https://openssl-library.org/post/2025-02-20-openssl-3.5-lts/)

[5-02-20-openssl-3.5-lts/). OpenSSL Library. February 20, 2025. Retrieved May 15, 2026.](https://openssl-library.org/post/2025-02-20-openssl-3.5-lts/)
[12. "New Governance Structure and New Projects under the Mission" (https://openssl-library.org/post/](https://openssl-library.org/post/2024-07-24-openssl-new-governance-structure/)

[2024-07-24-openssl-new-governance-structure/). OpenSSL Library. July 24, 2024. Retrieved](https://openssl-library.org/post/2024-07-24-openssl-new-governance-structure/)
May 15, 2026.
[13. Laurie, Ben (January 6, 1999). "Announce: OpenSSL (Take 2)" (https://marc.info/?l=ssl-users&m=](https://marc.info/?l=ssl-users&m=91566086807308&w=2)

[91566086807308&w=2).](https://marc.info/?l=ssl-users&m=91566086807308&w=2) _ssl-users_ (Mailing list). Retrieved May 15, 2026.
[14. "OpenSSL Documentation" (https://docs.openssl.org/). OpenSSL Library. Retrieved May 15, 2026.](https://docs.openssl.org/)
15. Viega, John; Messier, Matt; Chandra, Pravir (2002). _Network Security with OpenSSL_ . O'Reilly

Media.
[16. "OpenSSL Security Advisory [07 Apr 2014]" (https://www.openssl.org/news/secadv/20140407.txt).](https://www.openssl.org/news/secadv/20140407.txt)

OpenSSL Project. April 7, 2014. Retrieved May 15, 2026.
[17. "CVE-2014-0160 Detail" (https://nvd.nist.gov/vuln/detail/CVE-2014-0160). National Institute of](https://nvd.nist.gov/vuln/detail/CVE-2014-0160)

Standards and Technology. Retrieved May 15, 2026.
[18. "The Heartbleed Bug" (https://heartbleed.com/). Codenomicon. April 7, 2014. Retrieved May 15,](https://heartbleed.com/)

2026.
[19. Mutton, Paul (April 8, 2014). "Half a million widely trusted websites vulnerable to Heartbleed bug"](https://news.netcraft.com/archives/2014/04/08/half-a-million-widely-trusted-websites-vulnerable-to-heartbleed-bug.html)

[(https://news.netcraft.com/archives/2014/04/08/half-a-million-widely-trusted-websites-vulnerable-to](https://news.netcraft.com/archives/2014/04/08/half-a-million-widely-trusted-websites-vulnerable-to-heartbleed-bug.html)
[-heartbleed-bug.html). Netcraft. Retrieved May 15, 2026.](https://news.netcraft.com/archives/2014/04/08/half-a-million-widely-trusted-websites-vulnerable-to-heartbleed-bug.html)
[20. Finley, Klint (April 9, 2014). "How Heartbleed Broke the Internet — And Why It Can Happen Again"](https://www.wired.com/2014/04/heartbleedslesson/)

[(https://www.wired.com/2014/04/heartbleedslesson/).](https://www.wired.com/2014/04/heartbleedslesson/) _Wired_ . Retrieved May 15, 2026.


https://en.wikipedia.org/wiki/OpenSSL 10/12


5/18/26, 3:22 PM OpenSSL - Wikipedia


[21. "Heartbleed Update" (https://web.archive.org/web/20140831101356/https://blogs.akamai.com/201](https://web.archive.org/web/20140831101356/https://blogs.akamai.com/2014/04/heartbleed-update.html)

[4/04/heartbleed-update.html). Akamai Technologies. April 11, 2014. Archived from the original (http](https://web.archive.org/web/20140831101356/https://blogs.akamai.com/2014/04/heartbleed-update.html)
[s://blogs.akamai.com/2014/04/heartbleed-update.html) on August 31, 2014. Retrieved May 15,](https://blogs.akamai.com/2014/04/heartbleed-update.html)
2026.
[22. "The Results of the CloudFlare Challenge" (https://blog.cloudfare.com/the-results-of-the-cloudfar](https://blog.cloudflare.com/the-results-of-the-cloudflare-challenge/)

[e-challenge/). Cloudflare. April 11, 2014. Retrieved May 15, 2026.](https://blog.cloudflare.com/the-results-of-the-cloudflare-challenge/)
[23. Perlroth, Nicole; Larson, Jeff; Shane, Scott (September 6, 2013). "N.S.A. Able to Foil Basic](https://www.nytimes.com/2013/09/06/us/nsa-foils-much-internet-encryption.html)

[Safeguards of Privacy on Web" (https://www.nytimes.com/2013/09/06/us/nsa-foils-much-internet-e](https://www.nytimes.com/2013/09/06/us/nsa-foils-much-internet-encryption.html)
[ncryption.html).](https://www.nytimes.com/2013/09/06/us/nsa-foils-much-internet-encryption.html) _The New York Times_ . Retrieved May 15, 2026.
[24. Marquess, Steve (April 12, 2014). "Of Money, Responsibility, and Pride" (https://web.archive.org/w](https://web.archive.org/web/20150204105735/http://veridicalsystems.com/blog/of-money-responsibility-and-pride/)

[eb/20150204105735/http://veridicalsystems.com/blog/of-money-responsibility-and-pride/).](https://web.archive.org/web/20150204105735/http://veridicalsystems.com/blog/of-money-responsibility-and-pride/)
[Veridical Systems. Archived from the original (http://veridicalsystems.com/blog/of-money-responsi](http://veridicalsystems.com/blog/of-money-responsibility-and-pride/)
[bility-and-pride/) on February 4, 2015. Retrieved May 15, 2026.](http://veridicalsystems.com/blog/of-money-responsibility-and-pride/)
[25. Brodkin, Jon (April 22, 2014). "OpenSSL code beyond repair, claims creator of "LibreSSL" fork" (ht](https://arstechnica.com/information-technology/2014/04/openssl-code-beyond-repair-claims-creator-of-libressl-fork/)

[tps://arstechnica.com/information-technology/2014/04/openssl-code-beyond-repair-claims-creator-](https://arstechnica.com/information-technology/2014/04/openssl-code-beyond-repair-claims-creator-of-libressl-fork/)
[of-libressl-fork/).](https://arstechnica.com/information-technology/2014/04/openssl-code-beyond-repair-claims-creator-of-libressl-fork/) _Ars Technica_ . Retrieved May 15, 2026.
[26. Goodin, Dan (June 20, 2014). "Google unveils independent "fork" of OpenSSL called](https://arstechnica.com/information-technology/2014/06/google-unveils-independent-fork-of-openssl-called-boringssl/)

["BoringSSL" " (https://arstechnica.com/information-technology/2014/06/google-unveils-independen](https://arstechnica.com/information-technology/2014/06/google-unveils-independent-fork-of-openssl-called-boringssl/)
[t-fork-of-openssl-called-boringssl/).](https://arstechnica.com/information-technology/2014/06/google-unveils-independent-fork-of-openssl-called-boringssl/) _Ars Technica_ . Retrieved May 15, 2026.
[27. "Release Strategy" (https://openssl-library.org/policies/releasestrat/). OpenSSL Library. Retrieved](https://openssl-library.org/policies/releasestrat/)

May 15, 2026.
[28. "OpenSSL 3.0 update" (https://openssl-library.org/post/2019-11-07-3.0-update/). OpenSSL Library.](https://openssl-library.org/post/2019-11-07-3.0-update/)

November 7, 2019. Retrieved May 15, 2026.
[29. "OpenSSL 3.0 FIPS Module has been submitted for validation" (https://openssl-library.org/post/20](https://openssl-library.org/post/2021-09-22-openssl3-fips-submission/)

[21-09-22-openssl3-fps-submission/). OpenSSL Library. September 22, 2021. Retrieved May 15,](https://openssl-library.org/post/2021-09-22-openssl3-fips-submission/)
2026.
[30. "OpenSSL 3.1.2: FIPS 140-3 Validated" (https://openssl-library.org/post/2025-03-11-fps-140-3/).](https://openssl-library.org/post/2025-03-11-fips-140-3/)

OpenSSL Library. March 11, 2025. Retrieved May 15, 2026.
[31. "OpenSSL 3.5 Final Release" (https://openssl-library.org/post/2025-04-08-openssl-35-fnal-releas](https://openssl-library.org/post/2025-04-08-openssl-35-final-release/)

[e/). OpenSSL Library. April 8, 2025. Retrieved May 15, 2026.](https://openssl-library.org/post/2025-04-08-openssl-35-final-release/)
[32. "OpenSSL 3.0 Migration Guide" (https://docs.openssl.org/master/man7/ossl-guide-migration/).](https://docs.openssl.org/master/man7/ossl-guide-migration/)

OpenSSL Library. Retrieved May 15, 2026.
[33. "GOST engine OpenSSL 1.0.0 README" (https://cvs.openssl.org/fleview?f=openssl/engines/ccg](https://cvs.openssl.org/fileview?f=openssl/engines/ccgost/README.gost)

[ost/README.gost). OpenSSL Project. Retrieved May 15, 2026.](https://cvs.openssl.org/fileview?f=openssl/engines/ccgost/README.gost)
[34. Bolek, Martin (February 10, 2026). "We Released Our Annual Report 2025" (https://openssl-corpor](https://openssl-corporation.org/post/2026-02-10-annual-report-2025/)

[ation.org/post/2026-02-10-annual-report-2025/). OpenSSL Corporation. Retrieved May 15, 2026.](https://openssl-corporation.org/post/2026-02-10-annual-report-2025/)
[35. "OpenSSL Foundation publishes frst ever annual report" (https://openssl-library.org/post/2024-12-](https://openssl-library.org/post/2024-12-23-foundation-annual-report/)

[23-foundation-annual-report/). OpenSSL Library. December 23, 2024. Retrieved May 15, 2026.](https://openssl-library.org/post/2024-12-23-foundation-annual-report/)
[36. "Security Policy" (https://openssl-library.org/policies/general/security-policy/). OpenSSL Library.](https://openssl-library.org/policies/general/security-policy/)

Retrieved May 15, 2026.
[37. "DSA-1571-1 openssl — predictable random number generator" (https://www.debian.org/security/](https://www.debian.org/security/2008/dsa-1571)

[2008/dsa-1571). Debian Project. May 13, 2008. Retrieved May 15, 2026.](https://www.debian.org/security/2008/dsa-1571)
[38. "Vulnerabilities" (https://openssl-library.org/news/vulnerabilities/). OpenSSL Library. Retrieved](https://openssl-library.org/news/vulnerabilities/)

May 15, 2026.
[39. "OpenSSL Security Advisory [8 February 2011]" (https://www.openssl.org/news/secadv/20110208.t](https://www.openssl.org/news/secadv/20110208.txt)

[xt). OpenSSL Project. February 8, 2011. Retrieved May 15, 2026.](https://www.openssl.org/news/secadv/20110208.txt)
[40. "OpenSSL Security Advisory [19 April 2012]" (https://www.openssl.org/news/secadv/20120419.tx](https://www.openssl.org/news/secadv/20120419.txt)

[t). OpenSSL Project. April 19, 2012. Retrieved May 15, 2026.](https://www.openssl.org/news/secadv/20120419.txt)


https://en.wikipedia.org/wiki/OpenSSL 11/12


5/18/26, 3:22 PM OpenSSL - Wikipedia


41. AlFardan, Nadhem J.; Paterson, Kenneth G. (May 2013). _[Lucky Thirteen: Breaking the TLS and](https://ieeexplore.ieee.org/document/6547131)_

_DTLS Record Protocols_ [(https://ieeexplore.ieee.org/document/6547131). 2013 IEEE Symposium](https://ieeexplore.ieee.org/document/6547131)
on Security and Privacy. IEEE. Retrieved May 15, 2026.
[42. "OpenSSL Security Advisory [05 Jun 2014]" (https://www.openssl.org/news/secadv/20140605.txt).](https://www.openssl.org/news/secadv/20140605.txt)

OpenSSL Project. June 5, 2014. Retrieved May 15, 2026.
[43. "OpenSSL Security Advisory [19 Mar 2015]" (https://www.openssl.org/news/secadv/20150319.txt).](https://www.openssl.org/news/secadv/20150319.txt)

OpenSSL Project. March 19, 2015. Retrieved May 15, 2026.
[44. Goodin, Dan (January 28, 2016). "High-severity bug in OpenSSL allows attackers to decrypt](https://arstechnica.com/information-technology/2016/01/high-severity-bug-in-openssl-allows-attackers-to-decrypt-https-traffic/)

[HTTPS traffc" (https://arstechnica.com/information-technology/2016/01/high-severity-bug-in-open](https://arstechnica.com/information-technology/2016/01/high-severity-bug-in-openssl-allows-attackers-to-decrypt-https-traffic/)
[ssl-allows-attackers-to-decrypt-https-traffc/).](https://arstechnica.com/information-technology/2016/01/high-severity-bug-in-openssl-allows-attackers-to-decrypt-https-traffic/) _Ars Technica_ . Retrieved May 15, 2026.
[45. "Agglomerated SSL" (https://github.com/conformal/assl).](https://github.com/conformal/assl) _GitHub_ . September 7, 2010. Retrieved

May 15, 2026.
[46. Vaughan-Nichols, Steven J. (April 21, 2014). "OpenBSD forks, prunes, fxes OpenSSL" (https://ww](https://www.zdnet.com/article/openbsd-forks-prunes-fixes-openssl/)

[w.zdnet.com/article/openbsd-forks-prunes-fxes-openssl/).](https://www.zdnet.com/article/openbsd-forks-prunes-fixes-openssl/) _ZDNET_ . Retrieved May 15, 2026.
[47. Langley, Adam (June 20, 2014). "BoringSSL" (https://www.imperialviolet.org/2014/06/20/boringssl.](https://www.imperialviolet.org/2014/06/20/boringssl.html)

[html).](https://www.imperialviolet.org/2014/06/20/boringssl.html) _ImperialViolet_ . Retrieved May 15, 2026.
[48. "AWS-LC is a general-purpose cryptographic library" (https://github.com/aws/aws-lc).](https://github.com/aws/aws-lc) _GitHub_ .

Amazon Web Services. Retrieved May 15, 2026.
[49. "The offcial repository for the QuicTLS project" (https://github.com/quictls/quictls).](https://github.com/quictls/quictls) _GitHub_ .

Retrieved May 15, 2026.
[50. Belyavskiy, Dmitry. "The experience of bringing OpenSSL 3.0 into Red Hat Enterprise Linux and](https://www.redhat.com/en/blog/experience-bringing-openssl-30-rhel-and-fedora)

[Fedora" (https://www.redhat.com/en/blog/experience-bringing-openssl-30-rhel-and-fedora). Red](https://www.redhat.com/en/blog/experience-bringing-openssl-30-rhel-and-fedora)
Hat. Retrieved May 15, 2026.
[51. Caswell, Matt (February 17, 2020). "QUIC and OpenSSL" (https://openssl-library.org/post/2020-02](https://openssl-library.org/post/2020-02-13-quic-and-openssl/)

[-13-quic-and-openssl/). OpenSSL Library. Retrieved May 15, 2026.](https://openssl-library.org/post/2020-02-13-quic-and-openssl/)
[52. Stenberg, Daniel (October 25, 2021). "The QUIC API OpenSSL will not provide" (https://daniel.hax](https://daniel.haxx.se/blog/2021/10/25/the-quic-api-openssl-will-not-provide/)

[x.se/blog/2021/10/25/the-quic-api-openssl-will-not-provide/).](https://daniel.haxx.se/blog/2021/10/25/the-quic-api-openssl-will-not-provide/) _daniel.haxx.se_ . Retrieved May 15,
2026.
[53. "Various Licenses and Comments about Them" (https://www.gnu.org/licenses/license-list.html).](https://www.gnu.org/licenses/license-list.html)

Free Software Foundation. Retrieved May 15, 2026.
[54. Salz, Rich (August 1, 2015). "License Agreements and Changes Are Coming" (https://openssl-libra](https://openssl-library.org/post/2015-08-01-cla/)

[ry.org/post/2015-08-01-cla/). OpenSSL Library. Retrieved May 15, 2026.](https://openssl-library.org/post/2015-08-01-cla/)

## **External links**


[Offcial website (https://www.openssl.org/)](https://www.openssl.org/)
[OpenSSL documentation (https://docs.openssl.org/)](https://docs.openssl.org/)
[OpenSSL source repository (https://github.com/openssl/openssl)](https://github.com/openssl/openssl)
[OpenSSL vulnerabilities (https://openssl-library.org/news/vulnerabilities/)](https://openssl-library.org/news/vulnerabilities/)


[Retrieved from "https://en.wikipedia.org/w/index.php?title=OpenSSL&oldid=1354456820"](https://en.wikipedia.org/w/index.php?title=OpenSSL&oldid=1354456820)


https://en.wikipedia.org/wiki/OpenSSL 12/12


