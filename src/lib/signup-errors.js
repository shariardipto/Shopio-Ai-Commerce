export function signupErrorMessage(error) {
  const message = error?.message || "";

  if (error?.code === "over_email_send_rate_limit" || /email rate limit exceeded/i.test(message)) {
    return "We couldn't send a confirmation email because the email limit has been reached. Please try again later.";
  }
  if (error?.code === "over_request_rate_limit" || error?.status === 429) {
    return "Too many signup attempts. Please wait a few minutes before trying again.";
  }
  if (error?.code === "email_address_not_authorized") {
    return "Signup emails are temporarily unavailable. Please try again later.";
  }

  return message || "Could not create account. Please try again.";
}
