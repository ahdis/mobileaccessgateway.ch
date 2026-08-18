#!/usr/bin/env python3
"""Generates the four static pages from shared chrome + per-page bodies.
Output is plain HTML that GitHub Pages serves as-is (no Jekyll, no Actions)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from layout import page, social_row, rel
import re as _re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))

def read(name):
    return open(os.path.join(HERE, 'content', name), encoding='utf-8').read()

# --------------------------------------------------------------------------
# Home. Section order and the desktop/mobile placement of every feature group
# follow _design/GRID.md. Source order is MOBILE order (image always first);
# the desktop alternation is done with grid-column, never with source order.
# --------------------------------------------------------------------------
FEATURES = [
    ("image-left",  "icon-open-source", "Open source software",
     "Why open-source software?",
     # the original is a single paragraph with a double <br>, not two <p>
     '<p>&ldquo;Open source&rdquo; refers to any kind of software that is available under an '
     'open source licence. It allows anyone using the code under that licence to use and modify '
     'the source code to meet their own specific needs. Open source software offers: visibility '
     'into source code for full transparency, open standards for interoperability; and shared '
     'development costs for open source projects, among many other advantages.<br><br>'
     'Become part of the open community! Benefit from collective knowledge and advance the '
     'progress of healthcare interoperability.</p>',
     "See contributors", "/contributors"),
    ("image-right", "icon-epr", "Swiss Electronic Patient Record",
     "What is the Swiss EPR?",
     '<p>The <a href="https://www.patientrecord.ch/" target="_blank" rel="noopener">Swiss '
     'Electronic Patient Record (EPR)</a> is where your personal health-related documents can be '
     'collected together. With the EPR, you have control over your documents and you can enable '
     'your healthcare professionals to access treatment-relevant information regardless of time '
     'and place. This is a patient-centric approach: so you can decide for yourself who may view '
     'which of your documents and when.</p>'
     '<p>Take advantage of the opportunity that health information is accessible at any time via '
     'a secure internet connection: on a computer or smartphone, at home or on the go.</p>',
     "Find out more", "https://www.patientrecord.ch/"),
    ("image-left",  "icon-mhealth", "Mobile health",
     "How does mobile health work?",
     '<p><a href="https://www.e-health-suisse.ch/technik/technische-interoperabilitaet/mhealth-beim-epd" '
     'target="_blank" rel="noopener">Mobile health (mHealth)</a> is the organizational and '
     'technical requirement to send, store and access health-related data via the EPR, with '
     'mobile applications and devices. According to Swiss regulations and legislation, EPR '
     'providers must support certain technical profiles defined by the '
     '<a href="https://www.ihe.net/" target="_blank" rel="noopener">IHE (Integrating the '
     'Healthcare Enterprise)</a> to ensure interoperability. Although IHE FHIR-based mobile '
     'profiles are not yet part of the regulation, it is still worth providing a simplified '
     'interface for mobile access. The need to reuse healthcare data from mobile devices and '
     'applications is growing rapidly.</p>'
     '<p>The proposed <a href="https://fhir.ch/ig/ch-epr-fhir/index.html" target="_blank" '
     'rel="noopener">CH EPR FHIR specification</a> has already been implemented into the Mobile '
     'Access Gateway. You can therefore use the Mobile Access Gateway to connect your '
     'application to the Swiss EPR via FHIR.</p>',
     "Contact us", "/contact"),
]

def feature(variant, img, alt, heading, body, btn_label, btn_href):
    """Heading, prose and button are separate grid items because the original
    gives each its own column span (see _design/GRID.md); source order is the
    mobile order."""
    ext = ' target="_blank" rel="noopener"' if btn_href.startswith('http') else ''
    return f"""    <div class="feature feature--{variant}">
      <div class="feature__media">
        <img src="/assets/img/{img}.webp" width="600" height="600" alt="{alt}" loading="lazy">
      </div>
      <h3 class="feature__heading">{heading}</h3>
      <div class="feature__prose">{body}</div>
      <div class="feature__cta"><a class="button button--olive" href="{btn_href}"{ext}>{btn_label}</a></div>
    </div>"""

home_body = f"""  <section class="section section--bright hero">
    <div class="wrap hero__inner">
      <h1 class="visually-hidden">Mobile Access Gateway</h1>
      <div class="hero__media">
        <picture>
          <source srcset="/assets/img/hero-icons.webp" type="image/webp">
          <img src="/assets/img/hero-icons.gif" width="2500" height="2500"
               alt="Animated Mobile Access Gateway icons">
        </picture>
      </div>
      <div class="hero__body">
        <p class="hero__lede">The Mobile Access Gateway (MAG) is an open source initiative to
          support the integration of your application with the Swiss Electronic Patient Record
          (EPR). It allows you to connect your application to the Swiss EPR via
          <a href="https://www.hl7.org/fhir/" target="_blank" rel="noopener">HL7&reg; FHIR&reg;</a>,
          the standard for healthcare interoperability, under the terms of the proposed
          CH EPR FHIR specification.</p>
        <p class="hero__lede">The Mobile Access Gateway can be deployed as a microservice in your
          IT infrastructure.</p>
        <p class="hero__lede">The software is licenced under the business-friendly
          <a href="https://github.com/ahdis/MobileAccessGateway/blob/master/LICENSE"
             target="_blank" rel="noopener">Apache Software License 2.0</a> and is based on the
          <a href="https://oehf.github.io/ipf/" target="_blank" rel="noopener">IPF</a> and
          <a href="https://hapifhir.io/" target="_blank" rel="noopener">HAPI FHIR</a> platforms.</p>
        <p class="hero__cta"><a class="button" href="/contact">Contact Us</a></p>
      </div>
    </div>
  </section>

  <section class="section section--white nutshell">
    <div class="nutshell__head"><h2 class="nutshell__title">In A Nutshell</h2></div>
{feature(*FEATURES[0])}
    <div class="grid-row"><hr class="rule"></div>
{feature(*FEATURES[1])}
    <div class="grid-row"><hr class="rule"></div>
{feature(*FEATURES[2])}
  </section>

  <section class="section section--light">
    <div class="wrap">
      <h2 style="text-align:center">Your FHIR-based connection to the Swiss EPR</h2>
    </div>
  </section>"""

# --------------------------------------------------------------------------
CONTRIBUTORS = [
    ("logo-hci-solutions", "HCI Solutions", "https://www.hcisolutions.ch",
     '<p><a href="https://www.hcisolutions.ch" target="_blank" rel="noopener">HCI Solutions</a> is '
     'the initiator of the Mobile Access Gateway. Its goal is to connect its eHealth Platform '
     '<a href="https://www.hcisolutions.ch/de/produkte/documedis.php" target="_blank" '
     'rel="noopener">Documedis&reg;</a> with the Swiss EPR and the eMedication Service. The '
     'integration of the Mobile Access Gateway enables the exchange of eMedication data between '
     'primary system and connected community through Documedis&reg;.</p>'
     '<p>The connections between Documedis&reg; and the Swiss EPR and eMedication Service have '
     'been repeatedly and successfully tested at the Projectathon for the Swiss EPR.</p>'),
    ("logo-i4mi-bfh", "I4MI @ BFH",
     "https://www.bfh.ch/en/research/research-areas/institute-medical-informatics-i4mi/",
     '<p>The <a href="https://www.bfh.ch/en/research/research-areas/institute-medical-informatics-i4mi/" '
     'target="_blank" rel="noopener">Institute for Medical Informatics I4MI</a> at the '
     '<a href="https://www.bfh.ch/en/" target="_blank" rel="noopener">Bern University of Applied '
     'Sciences BFH</a> is the main developer of the Mobile Access Gateway. I4MI was able to '
     'successfully tested the Mobile Access Gateway repeatedly at the Projectathon for the Swiss '
     'EPR to ensure it conforms with the mHealth specifications.</p>'
     '<p>The Mobile Access Gateway is also used to connect to the '
     '<a href="https://epdplayground.ch" target="_blank" rel="noopener">EPR Playground</a>, a '
     'stand-alone demonstration <a href="https://epdplayground.ch/index.php?title=Mobile_Access_Gateway" '
     'target="_blank" rel="noopener">instance</a> of the Swiss EPR platform.</p>'),
    ("logo-ahdis", "ahdis", "https://ahdis.ch/en/home",
     '<p><a href="https://www.ahdis.ch/en/home" target="_blank" rel="noopener">ahdis</a> provides '
     'assistance to the development of the Mobile Access Gateway and offers professional services '
     'and support for realising integration with the Swiss EPR and the eMedication Service.</p>'
     '<p>For integration projects, ahdis hosts public test instances in the cloud. This enables '
     'all partners to rapidly develop their integration before using the Mobile Access Gateway in '
     'production within their customers infrastructure.</p>'),
]

cards = "\n".join(f"""      <li class="contributor">
        <div class="contributor__logo">
          <img src="/assets/img/{img}.webp" width="800" height="433" alt="{name}" loading="lazy">
        </div>
        <h2 class="contributor__title">{name}</h2>
        <div class="contributor__body">{body}</div>
        <div class="contributor__cta">
          <a class="button button--olive" href="{href}" target="_blank" rel="noopener">{name}</a>
        </div>
      </li>""" for img, name, href, body in CONTRIBUTORS)

contributors_body = f"""  <section class="section section--inverse page">
    <div class="wrap">
      <p class="page__title">Contributors</p>
      <h1 class="visually-hidden">Contributors</h1>
      <ul class="contributor-list">
{cards}
      </ul>
    </div>
  </section>"""

# --------------------------------------------------------------------------
contact_body = f"""  <section class="section section--bright contact">
    <div class="wrap contact__grid">
      <div class="contact__left">
        <h1 class="contact__title">Contact us.</h1>
        <address class="address">
          ahdis ag<br>c/o Impact Hub Z&uuml;rich<br>Sihlquai 131<br>8005 Z&uuml;rich<br>Switzerland
        </address>
        <div class="contact__social">
{social_row()}
        </div>
      </div>
      <div class="contact__right">
        <p class="contact__lede">Write to us and we will come back to you.</p>
        <p><a class="button" href="mailto:info@ahdis.ch">info@ahdis.ch</a></p>
      </div>
    </div>
  </section>

  <section class="section section--band">
    <div class="wrap">
      <h2 class="band__title">ahdis provides you with support - get in touch!</h2>
    </div>
  </section>"""

privacy_body = f"""  <section class="section section--bright privacy">
    <h1 class="privacy__title">Privacy Policy</h1>
    <div class="prose privacy__prose">
{read('privacy-policy.html')}
    </div>
  </section>"""

# --------------------------------------------------------------------------
def localize(html, base):
    """Rewrite site-root href/src in a page body to be relative to that page."""
    return _re.sub(r'(href|src|srcset)="(/[^"]*)"',
                   lambda m: f'{m.group(1)}="{rel(m.group(2), base)}"', html)


PAGES = [
    ('index.html', 'Mobile Access Gateway',
     'The Mobile Access Gateway is an open source FHIR-based connection to the Swiss '
     'Electronic Patient Record (EPR).', home_body, '', '/'),
    ('contributors/index.html', 'Contributors &mdash; Mobile Access Gateway',
     'The organisations behind the Mobile Access Gateway: HCI Solutions, I4MI @ BFH and ahdis.',
     contributors_body, '/contributors', '/contributors'),
    ('contact/index.html', 'Contact &mdash; Mobile Access Gateway',
     'Get in touch with ahdis ag about the Mobile Access Gateway.',
     contact_body, '/contact', '/contact'),
    ('privacy-policy/index.html', 'Privacy Policy &mdash; Mobile Access Gateway',
     'How the Mobile Access Gateway collects and processes personal data.',
     privacy_body, '', '/privacy-policy'),
]

for name, title, desc, body, active, canonical in PAGES:
    depth = name.count('/')
    base = '../' * depth
    out = page(title, desc, localize(body, base), active, canonical, base=base)
    dest = os.path.join(ROOT, name)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, 'w', encoding='utf-8').write(out)
    print(f"  {name:24} {len(out):7} bytes")
print("build complete")
