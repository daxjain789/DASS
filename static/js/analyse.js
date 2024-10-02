function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

let button = document.getElementById("btn");
button.addEventListener("click", function () {
    const element = document.getElementById('GFG');
    // const options = {
    //     filename: 'ReportAnalysis.pdf',
    //     margin: 0.5,
    //     // image: { type: 'jpeg', quality: 1 },
    //     // htm: { scale: 2 },
    //     jsPDF: {
    //         unit: 'cm',
    //         format: 'a4',
    //         orientation: 'p'
    //     },
    //     pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    // };

    // html2pdf().set(options).from(element).save();
    // html2pdf(element, options);

    var pdf = new jsPDF('p', 'pt', 'letter');
    // source can be HTML-formatted string, or a reference
    // to an actual DOM element from which the text will be scraped.
    source = $('#content')[0];

    // we support special element handlers. Register them with jQuery-style 
    // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
    // There is no support for any other type of selectors 
    // (class, of compound) at this time.
    specialElementHandlers = {
        '#bypassme': function (element, renderer) {
            return true
        }
    };
    margins = {
        top: 80,
        bottom: 60,
        left: 40,
        width: 522
    };
    pdf.fromHTML(
        element, // HTML string or DOM elem ref.
        margins.left, // x coord
        margins.top, { // y coord
            'width': margins.width, // max width of content on PDF
            'elementHandlers': specialElementHandlers
        },
        function (dispose) {
            pdf.save('Test.pdf');
        }, 
        margins
    );

});

function getSolutions() {
    var formData = new FormData();
    formData.append("path", getCookie('path'));
    $.ajax({
        data: formData,
        type: "POST",
        url: "/reportAnalysis",
        contentType: false,
        processData: false,
        beforeSend: function () {
            console.log("Message Sent")
        },
        timeout: 90000,
        success: function (response) {  
            document.querySelector(".solution").innerHTML = marked.parse(response['data'])
        },
        error: function (response) {
            console.log("Error:", response)
        },
        complete: function (data) {
            console.log("Complete!")
        }
    });

    // response = `
    // ## Valuefy Cybersecurity Audit Report Analysis: Key Findings, Risks, and Recommendations

    // **Key Findings:**

    // The audit reveals several significant vulnerabilities, security gaps, and compliance issues within Valuefy, particularly concerning its Wealthfy EAM application:

    // **1. Risk Management Deficiencies:**

    // * **Finding:** Lack of a robust risk management process, especially concerning changes and implementations within the Wealthfy EAM application.      
    // * **Risk:** Potential for unmitigated risks arising from application changes, leading to security breaches, data loss, or operational disruptions.   
    // * **Severity:** High

    // **2. Inadequate Training and Awareness Programs:**

    // * **Finding:** Insufficient security awareness training for existing employees and a lack of mandatory GDPR training for all staff.
    // * **Risk:** Increased susceptibility to social engineering attacks, data breaches due to human error, and non-compliance with GDPR requirements.     
    // * **Severity:** High

    // **3. Incomplete Policies and Procedures:**

    // * **Finding:** Missing or incomplete policies related to internet usage, remote access, data classification, risk assessment, and malware protection.
    // * **Risk:** Lack of clear guidelines and procedures for employees, increasing the risk of security incidents and hindering incident response efforts.
    // * **Severity:** Medium

    // **4. Limited Incident Reporting and Response Awareness:**

    // * **Finding:** While an incident response process exists, staff members lack awareness regarding incident reporting procedures.
    // * **Risk:** Delayed or ineffective incident response, potentially exacerbating the impact of security incidents.
    // * **Severity:** Medium

    // **5. Insufficient Business Continuity Management Testing:**

    // * **Finding:** Lack of full-scale or parallel testing for the business continuity plan, making it difficult to validate the effectiveness of RTO and RPO values.
    // * **Risk:** Potential failure to recover critical operations within the desired timeframe in the event of a major disruption.
    // * **Severity:** Medium

    // **6. Lack of Third-Party Security Oversight:**

    // * **Finding:** No established provisions for assessing and validating the security controls of Valuefy's partner organizations.
    // * **Risk:** Increased risk of data breaches or security incidents originating from third-party vulnerabilities.
    // * **Severity:** Medium

    // **7. Incomplete Third-Party Contracts:**

    // * **Finding:** Missing or incomplete contracts with some partner organizations, lacking provisions for due diligence and GDPR compliance.
    // * **Risk:** Potential legal and compliance issues, as well as increased risk of data breaches or misuse by partner organizations.
    // * **Severity:** Medium

    // **8. Absence of Security Monitoring Tools:**

    // * **Finding:** No implementation of security monitoring tools like IDS/IPS or SIEM, hindering real-time threat detection and prevention.
    // * **Risk:** Increased vulnerability to cyberattacks, delayed detection of security incidents, and difficulty in identifying and responding to threats.
    // * **Severity:** High

    // **9. Lack of Data Privacy Impact Assessments (DPIA):**

    // * **Finding:** No history of conducting DPIAs, indicating a lack of a structured process for identifying and mitigating data privacy risks.
    // * **Risk:** Potential non-compliance with GDPR requirements, increased risk of data breaches, and potential legal and reputational damage.
    // * **Severity:** Medium

    // **10. Insufficient Development Documentation:**

    // * **Finding:** Lack of detailed documentation regarding the development process, potentially hindering code maintenance, security reviews, and knowledge transfer.
    // * **Risk:** Increased risk of vulnerabilities in the application code, difficulties in troubleshooting and debugging, and potential delays in development cycles.
    // * **Severity:** Medium


    // **Recommendations:**

    // **1. Implement a Robust Risk Management Framework:**

    // * Establish a formal risk management process that includes regular risk assessments, identification of threats and vulnerabilities, and implementation of appropriate security controls.
    // * Integrate risk management into the application development lifecycle, ensuring that all changes and implementations are evaluated for potential risks.

    // **2. Enhance Security Awareness Training Programs:**

    // * Implement mandatory security awareness training for all employees, covering topics like social engineering, phishing, password security, and data protection.
    // * Conduct regular GDPR training sessions for all staff members and ensure compliance with GDPR requirements.

    // **3. Develop and Implement Missing Policies and Procedures:**

    // * Create and implement comprehensive policies covering internet usage, remote access, data classification, risk assessment, and malware protection.  
    // * Document all relevant internal processes and procedures to provide clear guidelines for employees and ensure consistency in security practices.    

    // **4. Improve Incident Reporting and Response Awareness:**

    // * Conduct user awareness sessions to educate staff members about incident reporting procedures and the importance of timely reporting.
    // * Establish clear communication channels for reporting security incidents and ensure that all employees are aware of these channels.

    // **5. Conduct Full-Scale Business Continuity Testing:**

    // * Perform full-scale or parallel testing of the business continuity plan to validate the effectiveness of recovery procedures and ensure that RTO and RPO values can be met.
    // * Review and update the BCP based on the results of the testing exercise.

    // **6. Implement Third-Party Security Oversight:**

    // * Establish a process for conducting third-party risk assessments and validating the security controls of partner organizations.
    // * Require partners to provide evidence of security certifications or undergo independent security audits.

    // **7. Formalize Third-Party Contracts:**

    // * Ensure that contracts are in place with all partner organizations, including provisions for due diligence, security requirements, and GDPR compliance.
    // * Regularly review and update contracts to reflect evolving security and compliance requirements.

    // **8. Implement Security Monitoring Tools:**

    // * Deploy network and device monitoring tools to gain visibility into network traffic and system activity.
    // * Implement an IDS/IPS solution to detect and prevent malicious activity in real-time.
    // * Deploy a SIEM solution to collect and analyze security logs, generate alerts, and facilitate incident response.

    // **9. Conduct Data Privacy Impact Assessments (DPIA):**

    // * Initiate regular DPIAs to identify and assess data privacy risks associated with Valuefy's operations and the Wealthfy EAM application.
    // * Establish a process for reviewing and updating DPIAs when changes occur that may impact data privacy risks.

    // **10. Improve Development Documentation:**

    // * Document the development process, including coding standards, security requirements, and testing procedures.
    // * Maintain detailed documentation related to the application code, including design specifications, comments, and version history.

    // with relevant standards and best practices. It is crucial to prioritize these actions based on the severity of the risks and the potential impact on the organization. Regular monitoring and evaluation of security controls are essential to maintain a strong security posture and adapt to evolving threats.
    // `
    // document.querySelector(".solution").innerHTML = marked.parse(response)

}
window.addEventListener("load", async (event) => {
    console.log("page is fully loaded");
    getSolutions()
})