/**
 * Security Utilities
 * Comprehensive security functions for the AITD Events platform
 */

// ============= DISPOSABLE EMAIL DETECTION =============

// Extended list of disposable/temporary email providers (800+ domains)
const DISPOSABLE_EMAIL_DOMAINS = [
  // Common temp mail services
  "tempmail.com", "temp-mail.org", "guerrillamail.com", "10minutemail.com",
  "mailinator.com", "throwaway.email", "fakeinbox.com", "trashmail.com",
  "tempail.com", "getnada.com", "mohmal.com", "emailondeck.com",
  "dispostable.com", "yopmail.com", "maildrop.cc", "mailnesia.com",
  "tempr.email", "discard.email", "fakemailgenerator.com", "tempinbox.com",
  "spamgourmet.com", "mytemp.email", "throwawaymail.com", "mintemail.com",
  "tempmailo.com", "burnermail.io", "mailcatch.com", "mailsac.com",
  
  // Additional disposable services
  "sharklasers.com", "guerrillamailblock.com", "spam4.me", "grr.la",
  "guerrillamail.biz", "guerrillamail.de", "guerrillamail.net", "guerrillamail.org",
  "pokemail.net", "spam4.me", "tmails.net", "trillianpro.com",
  "jetable.org", "link2mail.net", "meltmail.com", "dodgit.com",
  "dontsendmespam.de", "nobulk.com", "sogetthis.com", "spamgourmet.org",
  "getairmail.com", "putthisinyourspamdatabase.com", "SendSpamHere.com",
  "mailin8r.com", "mailmetrash.com", "jetable.net", "super-auswahl.de",
  "rcpt.at", "trash-mail.at", "trashmail.at", "wegwerfmail.de",
  "wegwerfmail.net", "wegwerfmail.org", "spamex.com", "spamcon.org",
  "10mail.org", "20minutemail.it", "4warding.org", "4warding.com",
  "0-mail.com", "0815.ru", "0clickemail.com", "1-8.biz",
  "1mail.ml", "1chuan.com", "2fdgdfgdfgdf.tk", "2prong.com",
  "3d-painting.com", "4warding.net", "5ghgfhfghfgh.tk", "5july.org",
  "6url.com", "75hosting.com", "75hosting.net", "99experts.com",
  
  // More comprehensive list
  "alivance.com", "ama-trade.de", "amilegit.com", "amiri.net",
  "amiriindustries.com", "anonbox.net", "anonymbox.com", "antichef.com",
  "antichef.net", "antireg.com", "antispam.de", "armyspy.com",
  "azmeil.tk", "baxomale.ht.cx", "beefmilk.com", "bigstring.com",
  "binkmail.com", "bio-muesli.net", "bobmail.info", "bodhi.lawlita.com",
  "boun.cr", "bouncr.com", "boxformail.in", "br.mintemail.com",
  "breakthru.com", "brefmail.com", "broadbandninja.com", "bsnow.net",
  "bspamfree.org", "bugmenot.com", "bumpymail.com", "bund.us",
  "burnthespam.info", "burstmail.info", "casualdx.com", "cek.pm",
  "centermail.com", "centermail.net", "chammy.info", "cheatmail.de",
  "chogmail.com", "choicemail1.com", "clixser.com", "cmail.net",
  "cobarekyo1.ml", "coldemail.info", "cool.fr.nf", "correo.blogos.net",
  "cosmorph.com", "courriel.fr.nf", "courrieltemporaire.com", "crapmail.org",
  "cust.in", "cuvox.de", "d3p.dk", "dacoolest.com",
  "dandikmail.com", "dayrep.com", "dcemail.com", "deadaddress.com",
  "deadspam.com", "delikkt.de", "despam.it", "despammed.com",
  "devnullmail.com", "dfgh.net", "digitalsanctuary.com", "dingbone.com",
  "discardmail.com", "discardmail.de", "disposableaddress.com", "disposableinbox.com",
  "dispose.it", "dispomail.eu", "dodgeit.com", "dodgit.org",
  "donemail.ru", "dontreg.com", "dontsendmespam.de", "drdrb.net",
  "dump-email.info", "dumpandjunk.com", "dumpmail.de", "dumpyemail.com",
  "e-mail.com", "e-mail.org", "e4ward.com", "easytrashmail.com",
  "einrot.com", "email-fake.com", "email60.com", "emaildienst.de",
  "emailias.com", "emaillime.com", "emailproxsy.com", "emailsensei.com",
  "emailtemporanea.com", "emailtemporanea.net", "emailtemporar.ro", "emailtemporario.com.br",
  "emailthe.net", "emailtmp.com", "emailto.de", "emailwarden.com",
  "emailx.at.hm", "emailxfer.com", "emeil.in", "emeil.ir",
  "emz.net", "ero-tube.org", "evopo.com", "explodemail.com",
  "express.net.ua", "eyepaste.com", "facebook-email.cf", "facebook-email.ga",
  "fake-box.com", "fake-email.pp.ua", "fake-mail.cf", "fake-mail.ga",
  "fakedemail.com", "fakeinbox.com", "fakeinbox.net", "fakemailgenerator.com",
  "fakemailz.com", "fammix.com", "fangoh.com", "fansworldwide.de",
  "fantasymail.de", "fastacura.com", "fastchevy.com", "fastchrysler.com",
  "fastkawasaki.com", "fastmazda.com", "fastmitsubishi.com", "fastnissan.com",
  "fastsubaru.com", "fastsuzuki.com", "fasttoyota.com", "fastyamaha.com",
  "fightallspam.com", "filzmail.com", "fir.hk", "fleckens.hu",
  "fr33mail.info", "frapmail.com", "freemeil.ga", "freemeil.gq",
  "freundin.ru", "front14.org", "fuckingduh.com", "fudgerub.com",
  "fux0ringduh.com", "fyii.de", "garliclife.com", "getairmail.cf",
  "getairmail.com", "getairmail.ga", "getairmail.gq", "getairmail.ml",
  "getairmail.tk", "getonemail.com", "getonemail.net", "ghosttexter.de",
  "giantmail.de", "girlsundertheinfluence.com", "gishpuppy.com", "gmial.com",
  "goemailgo.com", "gotmail.com", "gotmail.net", "gotmail.org",
  "gotti.otherinbox.com", "great-host.in", "greensloth.com", "grr.la",
  "gsrv.co.uk", "h.mintemail.com", "h8s.org", "hacccc.com",
  "haltospam.com", "harakirimail.com", "hatespam.org", "hellodream.mobi",
  "herp.in", "hidemail.de", "hidzz.com", "hmamail.com",
  "hochsitze.com", "hotpop.com", "hulapla.de", "ieatspam.eu",
  "ieatspam.info", "ieh-mail.de", "ihateyoualot.info", "iheartspam.org",
  "ikbenspamvrij.nl", "imails.info", "imgof.com", "inbax.tk",
  "inbox.si", "inboxalias.com", "inboxclean.com", "inboxclean.org",
  "incognitomail.com", "incognitomail.net", "incognitomail.org", "infocom.zp.ua",
  "instant-mail.de", "ip6.li", "ipoo.org", "irish2me.com",
  "iroid.com", "iwi.net", "jetable.com", "jetable.fr.nf",
  "jetable.net", "jetable.org", "jnxjn.com", "jourrapide.com",
  "junk1e.com", "kasmail.com", "kaspop.com", "keepmymail.com",
  "killmail.com", "killmail.net", "kir.ch.tc", "klassmaster.com",
  "klassmaster.net", "klzlk.com", "koszmail.pl", "kurzepost.de",
  "lawlita.com", "letthemeatspam.com", "lhsdv.com", "lifebyfood.com",
  "link2mail.net", "litedrop.com", "lol.ovpn.to", "lolfreak.net",
  "lookugly.com", "lopl.co.cc", "lortemail.dk", "lr78.com",
  "lroid.com", "lukop.dk", "m21.cc", "m4ilweb.info",
  "maboard.com", "mail-filter.com", "mail-temporaire.com", "mail-temporaire.fr",
  "mail.by", "mail.mezimages.net", "mail.zp.ua", "mail1a.de",
  "mail21.cc", "mail2rss.org", "mail333.com", "mail4trash.com",
  "mailbidon.com", "mailbiz.biz", "mailblocks.com", "mailbucket.org",
  "mailcatch.com", "mailde.de", "mailde.info", "maildrop.cc",
  "maildrop.cf", "maildrop.ga", "maildrop.gq", "maildrop.ml",
  "maileater.com", "mailexpire.com", "mailfa.tk", "mailforspam.com",
  "mailfree.ga", "mailfree.gq", "mailfree.ml", "mailfreeonline.com",
  "mailfs.com", "mailguard.me", "mailimate.com", "mailin8r.com",
  "mailinater.com", "mailinator.co.uk", "mailinator.com", "mailinator.net",
  "mailinator.org", "mailinator.us", "mailinator2.com", "mailincubator.com",
  "mailismagic.com", "mailme.gq", "mailme.ir", "mailme.lv",
  "mailme24.com", "mailmetrash.com", "mailmoat.com", "mailms.com",
  "mailnator.com", "mailnesia.com", "mailnull.com", "mailorg.org",
  "mailpick.biz", "mailproxsy.com", "mailquack.com", "mailrock.biz",
  "mailscrap.com", "mailshell.com", "mailsiphon.com", "mailslite.com",
  "mailtemp.info", "mailtome.de", "mailtothis.com", "mailtrash.net",
  "mailtv.net", "mailtv.tv", "mailzilla.com", "mailzilla.org",
  "makemetheking.com", "manybrain.com", "mbx.cc", "mega.zik.dj",
  "meinspamschutz.de", "meltmail.com", "messagebeamer.de", "ministry-of-silly-walks.de",
  "mintemail.com", "misterpinball.de", "moncourrier.fr.nf", "monemail.fr.nf",
  "monmail.fr.nf", "monumentmail.com", "mt2009.com", "mt2014.com",
  "mycard.net.ua", "mycleaninbox.net", "myecho.es", "mymail-in.net",
  "mypacks.net", "mypartyclip.de", "myphantomemail.com", "mysamp.de",
  "myspaceinc.com", "myspaceinc.net", "myspaceinc.org", "myspacepimpedup.com",
  "myspamless.com", "mytrashmail.com", "neomailbox.com", "nepwk.com",
  "nervmich.net", "nervtmich.net", "netmails.com", "netmails.net",
  "netzidiot.de", "neverbox.com", "no-spam.ws", "noblepioneer.com",
  "nobugmail.com", "noclickemail.com", "nogmailspam.info", "nomail.pw",
  "nomail.xl.cx", "nomail2me.com", "nomorespamemails.com", "nonspam.eu",
  "nonspammer.de", "noref.in", "nospam.ze.tc", "nospam4.us",
  "nospamfor.us", "nospammail.net", "notmailinator.com", "nowhere.org",
  "nowmymail.com", "nurfuerspam.de", "nus.edu.sg", "nwldx.com",
  "objectmail.com", "obobbo.com", "oneoffemail.com", "onewaymail.com",
  "online.ms", "opayq.com", "ordinaryamerican.net", "otherinbox.com",
  "ourklips.com", "outlawspam.com", "ovpn.to", "owlpic.com",
  "pancakemail.com", "paplease.com", "pcusers.otherinbox.com", "pjjkp.com",
  "plexolan.de", "poczta.onet.pl", "politikerclub.de", "poofy.org",
  "pookmail.com", "privacy.net", "privatdemail.net", "proxymail.eu",
  "prtnx.com", "putthisinyourspamdatabase.com", "pwrby.com", "quickinbox.com",
  "quickmail.nl", "rcpt.at", "reallymymail.com", "realtyalerts.ca",
  "recode.me", "reconmail.com", "recursor.net", "recyclemail.dk",
  "regbypass.com", "regspaces.tk", "rejectmail.com", "rhyta.com",
  "rklips.com", "rmqkr.net", "royal.net", "rppkn.com",
  "rtrtr.com", "s0ny.net", "safe-mail.net", "safersignup.de",
  "safetymail.info", "safetypost.de", "sandelf.de", "saynotospams.com",
  "schafmail.de", "schrott-email.de", "secretemail.de", "secure-mail.biz",
  "senseless-entertainment.com", "services391.com", "sharklasers.com", "shieldemail.com",
  "shiftmail.com", "shitmail.me", "shitmail.org", "shitware.nl",
  "shortmail.net", "sibmail.com", "sinnlos-mail.de", "slapsfromlastnight.com",
  "slaskpost.se", "slave-auctions.net", "smashmail.de", "smellfear.com",
  "snakemail.com", "sneakemail.com", "sneakmail.de", "snkmail.com",
  "sofimail.com", "solvemail.info", "sogetthis.com", "soodonims.com",
  "spam.la", "spam.su", "spam4.me", "spamail.de",
  "spamarrest.com", "spambox.us", "spamcannon.com", "spamcannon.net",
  "spamcon.org", "spamcorptastic.com", "spamcowboy.com", "spamcowboy.net",
  "spamcowboy.org", "spamday.com", "spamex.com", "spamfree.eu",
  "spamfree24.com", "spamfree24.de", "spamfree24.eu", "spamfree24.info",
  "spamfree24.net", "spamfree24.org", "spamgoes.in", "spamgourmet.com",
  "spamgourmet.net", "spamgourmet.org", "spamherelots.com", "spamhereplease.com",
  "spamhole.com", "spamify.com", "spaminator.de", "spamkill.info",
  "spaml.de", "spaml.com", "spammotel.com", "spamobox.com",
  "spamoff.de", "spamslicer.com", "spamspot.com", "spamstack.net",
  "spamthis.co.uk", "spamthisplease.com", "spamtrail.com", "speed.1s.fr",
  "spoofmail.de", "stuffmail.de", "super-auswahl.de", "supergreatmail.com",
  "supermailer.jp", "superrito.com", "superstachel.de", "suremail.info",
  "talkinator.com", "teewars.org", "teleworm.com", "teleworm.us",
  "temp-mail.com", "temp-mail.de", "temp-mail.org", "temp-mail.ru",
  "tempalias.com", "tempe-mail.com", "tempemail.biz", "tempemail.co.za",
  "tempemail.com", "tempemail.net", "tempinbox.co.uk", "tempinbox.com",
  "tempmail.co", "tempmail.de", "tempmail.eu", "tempmail.it",
  "tempmail.us", "tempmail2.com", "tempmaildemo.com", "tempmailer.com",
  "tempmailer.de", "tempomail.fr", "temporarily.de", "temporarioemail.com.br",
  "temporaryemail.net", "temporaryemail.us", "temporaryforwarding.com", "temporaryinbox.com",
  "temporarymailaddress.com", "tempthe.net", "thankyou2010.com", "thecloudindex.com",
  "thisisnotmyrealemail.com", "thismail.net", "throwam.com", "throwawayemailaddress.com",
  "throwawaymail.com", "tilien.com", "tittbit.in", "tizi.com",
  "tmailinator.com", "topranklist.de", "tradermail.info", "trash-amil.com",
  "trash-mail.at", "trash-mail.com", "trash-mail.de", "trash2009.com",
  "trash2010.com", "trash2011.com", "trashdevil.com", "trashdevil.de",
  "trashemail.de", "trashmail.at", "trashmail.com", "trashmail.de",
  "trashmail.me", "trashmail.net", "trashmail.org", "trashmail.ws",
  "trashmailer.com", "trashymail.com", "trashymail.net", "trillianpro.com",
  "turual.com", "twinmail.de", "tyldd.com", "uggsrock.com",
  "umail.net", "uroid.com", "us.af", "venompen.com",
  "veryrealemail.com", "viditag.com", "viralplays.com", "vpn.st",
  "vsimcard.com", "vubby.com", "wasteland.rfc822.org", "webemail.me",
  "wegwerf-email-addressen.de", "wegwerf-emails.de", "wegwerfadresse.de", "wegwerfemail.com",
  "wegwerfemail.de", "wegwerfemail.net", "wegwerfemail.org", "wegwerfemailadresse.com",
  "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org", "wetrainbayarea.com",
  "wetrainbayarea.org", "wh4f.org", "whatiaas.com", "whatpaas.com",
  "whopy.com", "willhackforfood.biz", "willselfdestruct.com", "winemaven.info",
  "wronghead.com", "wuzup.net", "wuzupmail.net", "wwwnew.eu",
  "xagloo.com", "xemaps.com", "xents.com", "xmaily.com",
  "xoxy.net", "yapped.net", "yep.it", "yogamaven.com",
  "yomail.info", "yopmail.com", "yopmail.fr", "yopmail.net",
  "you-spam.com", "yuurok.com", "z1p.biz", "za.com",
  "zehnminuten.de", "zehnminutenmail.de", "zippymail.info", "zoemail.net",
  "zoemail.org", "zoetropes.org", "zomg.info"
];

// Trusted email providers
const TRUSTED_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
  "icloud.com", "protonmail.com", "proton.me", "zoho.com", "aol.com",
  "mail.com", "gmx.com", "yandex.com", "mail.ru", "rediffmail.com",
  "fastmail.com", "hushmail.com", "tutanota.com", "posteo.de",
  "edu", "ac.in", "edu.in", "org", "gov.in", "ac.uk", "edu.au"
];

/**
 * Check if an email domain is disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
  if (!email) return true;
  const domain = email.toLowerCase().split("@")[1];
  if (!domain) return true;
  
  return DISPOSABLE_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`));
}

/**
 * Check if email is from a trusted provider
 */
export function isValidEmailDomain(email: string): boolean {
  if (!email) return false;
  const domain = email.toLowerCase().split("@")[1];
  if (!domain) return false;
  
  // Check educational domains
  if (domain.endsWith(".edu") || domain.endsWith(".ac.in") || 
      domain.endsWith(".edu.in") || domain.endsWith(".ac.uk") || 
      domain.endsWith(".edu.au")) {
    return true;
  }
  
  // Check trusted domains
  return TRUSTED_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`));
}

// ============= RATE LIMITING =============

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if action is rate limited
   * @param key - Unique identifier (e.g., userId, IP, email)
   * @param limit - Max actions allowed
   * @param windowMs - Time window in milliseconds
   */
  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= limit) {
      return false; // Rate limit exceeded
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining attempts
   */
  getRemaining(key: string, limit: number): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return limit;
    }
    return Math.max(0, limit - entry.count);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global rate limiter instances
export const authRateLimiter = new RateLimiter();
export const apiRateLimiter = new RateLimiter();
export const commentRateLimiter = new RateLimiter();

// ============= SPAM DETECTION =============

/**
 * Check if text contains spam patterns
 */
export function containsSpam(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Spam keywords
  const spamKeywords = [
    "click here", "buy now", "act now", "limited time", "make money fast",
    "work from home", "bitcoin", "crypto investment", "forex", "weight loss",
    "viagra", "cialis", "casino", "poker", "lottery", "winner",
    "congratulations you won", "claim your prize", "free money",
    "nigerian prince", "inheritance", "beneficiary"
  ];
  
  // Check for spam keywords
  if (spamKeywords.some(keyword => lowerText.includes(keyword))) {
    return true;
  }
  
  // Check for excessive capitals (>50% of text)
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  const totalLetters = (text.match(/[a-zA-Z]/g) || []).length;
  if (totalLetters > 10 && capsCount / totalLetters > 0.5) {
    return true;
  }
  
  // Check for excessive special characters
  const specialCount = (text.match(/[!@#$%^&*()]/g) || []).length;
  if (text.length > 20 && specialCount / text.length > 0.2) {
    return true;
  }
  
  // Check for repeated characters (more than 5 times)
  if (/(.)\1{5,}/.test(text)) {
    return true;
  }
  
  // Check for excessive URLs (more than 3)
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) {
    return true;
  }
  
  return false;
}

/**
 * Check if user behavior is suspicious
 */
export function isSuspiciousBehavior(data: {
  rapidActions?: number; // Actions per minute
  duplicateContent?: boolean;
  unusualTiming?: boolean; // Activity at odd hours
}): boolean {
  const { rapidActions = 0, duplicateContent = false, unusualTiming = false } = data;
  
  // More than 20 actions per minute is suspicious
  if (rapidActions > 20) return true;
  
  // Duplicate content submission
  if (duplicateContent) return true;
  
  // Unusual timing (e.g., bot-like behavior)
  if (unusualTiming) return true;
  
  return false;
}

// ============= INPUT SANITIZATION =============

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize user input (remove potentially dangerous characters)
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  // Remove script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, "");
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  return sanitized.trim();
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return null;
    }
    
    return urlObj.toString();
  } catch {
    return null;
  }
}

// ============= PASSWORD STRENGTH =============

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, feedback: ["Password is required"], isValid: false };
  }

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length < 8) {
    feedback.push("Use at least 8 characters");
  }

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("Include both uppercase and lowercase letters");
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push("Include at least one number");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("Include at least one special character");
  }

  // Common patterns to avoid
  const commonPatterns = [
    /^123/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push("Avoid common patterns");
  }

  // Normalize score to 0-4 range
  score = Math.min(4, Math.max(0, score));

  return {
    score,
    feedback: feedback.length > 0 ? feedback : ["Strong password!"],
    isValid: score >= 3 && password.length >= 8
  };
}

// ============= SESSION MANAGEMENT =============

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if session is expired
 */
export function isSessionExpired(expiryTime: number): boolean {
  return Date.now() > expiryTime;
}

// ============= USER VERIFICATION =============

/**
 * Generate verification code (6 digits)
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Verify if code matches and is not expired
 */
export function verifyCode(
  provided: string,
  stored: string,
  expiryTime: number
): boolean {
  if (isSessionExpired(expiryTime)) return false;
  return provided === stored;
}

// ============= LOGGING & MONITORING =============

export interface SecurityEvent {
  type: "auth_failure" | "rate_limit" | "spam_detected" | "suspicious_activity" | "data_access";
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: string;
  timestamp: number;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  log(event: Omit<SecurityEvent, "timestamp">): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn("[Security Event]", fullEvent);
    }
  }

  getEvents(filter?: Partial<SecurityEvent>): SecurityEvent[] {
    if (!filter) return [...this.events];

    return this.events.filter(event => {
      for (const [key, value] of Object.entries(filter)) {
        if (event[key as keyof SecurityEvent] !== value) return false;
      }
      return true;
    });
  }

  clear(): void {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();

// ============= EXPORTS =============

export default {
  isDisposableEmail,
  isValidEmailDomain,
  authRateLimiter,
  apiRateLimiter,
  commentRateLimiter,
  containsSpam,
  isSuspiciousBehavior,
  sanitizeHTML,
  sanitizeInput,
  sanitizeURL,
  calculatePasswordStrength,
  generateSecureToken,
  isSessionExpired,
  generateVerificationCode,
  verifyCode,
  securityLogger
};
