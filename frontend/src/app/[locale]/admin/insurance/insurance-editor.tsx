"use client";

import Button from "@/components/button";
import DateField from "@/components/date-field";
import DropdownButton from "@/components/dropdown-button";
import TextField from "@/components/text-field";
import { InsuranceRequest } from "@/module/insurance/application/insuranceDto";
import InsuranceUsecase from "@/module/insurance/application/insuranceUsecase";
import ClaimDetailsEnum from "@/module/insurance/doamin/claimDetailsEnum";
import LocationEnum from "@/module/insurance/doamin/locationEnum";
import PaymentTypeEnum from "@/module/insurance/doamin/paymentTypeEnum";
import InsuranceRepoImpl from "@/module/insurance/presenter/insuranceRepoImpl";
import EmailValidationUsecase from "@/module/validation/application/emailValidationUsecase";
import NotEmptyValidationUsecase from "@/module/validation/application/notEmptyValidationUsecase";
import NumberValidationUsecase from "@/module/validation/application/numberValidationUsecase";
import { useRouter } from "@/navigation";
import { faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "date-fns";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
  updateId?: number;
  locale: string;
  defaultValues?: {
    applicationDate?: Date;
    incidentDate?: Date;
    name?: string;
    studentId?: string;
    idNumber?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    claimDetails?: ClaimDetailsEnum;
    paymentType?: PaymentTypeEnum;
    location?: LocationEnum;
    incidentCause?: string;
    receipt?: string;
    diagnosisCertificate?: string;
    bankbook?: number;
    xRay?: number;
    applicationAmount?: number;
    claimAmount?: number;
    claimDate?: Date;
    remarks?: string;
    insuranceCompanyStamp?: boolean;
    insuranceCompanyTime?: Date;
  };
};

export default function InsuranceEditor({
  updateId,
  locale,
  defaultValues,
}: Props) {
  const trans = useTranslations("Insurance");

  const router = useRouter();

  const [applicationDate, setApplicationDate] = useState<Date | undefined>(defaultValues?.applicationDate);
  const [incidentDate, setIncidentDate] = useState<Date | undefined>(defaultValues?.incidentDate);
  const [name, setName] = useState<string>(defaultValues?.name ?? "");
  const [studentId, setStudentId] = useState<string>(defaultValues?.studentId ?? "");
  const [idNumber, setIdNumber] = useState<string>(defaultValues?.idNumber ?? "");
  const [address, setAddress] = useState<string>(defaultValues?.address ?? "");
  const [phoneNumber, setPhoneNumber] = useState<string>(defaultValues?.phoneNumber ?? "");
  const [email, setEmail] = useState<string>(defaultValues?.email ?? "");
  const [claimDetails, setClaimDetails] = useState<ClaimDetailsEnum>(defaultValues?.claimDetails ?? ClaimDetailsEnum.Accident);
  const [paymentType, setPaymentType] = useState<PaymentTypeEnum>(defaultValues?.paymentType ?? PaymentTypeEnum.Medical);
  const [location, setLocation] = useState<LocationEnum>(defaultValues?.location ?? LocationEnum.OnCampus);
  const [incidentCause, setIncidentCause] = useState<string>(defaultValues?.incidentCause ?? "");
  const [receipt, setReceipt] = useState<string>(defaultValues?.receipt ?? "");
  const [diagnosisCertificate, setDiagnosisCertificate] = useState<string>(defaultValues?.diagnosisCertificate ?? "");
  const [bankbook, setBankbook] = useState<number>(defaultValues?.bankbook ?? 0);
  const [xRay, setXRay] = useState<number>(defaultValues?.xRay ?? 0);
  const [applicationAmount, setApplicationAmount] = useState<string>(defaultValues?.applicationAmount?.toString() ?? "0");
  const [remarks, setRemarks] = useState<string>(defaultValues?.remarks ?? "");

  const [claimAmount, setClaimAmount] = useState<string | undefined>(defaultValues?.claimAmount?.toString());
  const [claimDate, setClaimDate] = useState<Date | undefined>(defaultValues?.claimDate);
  const [insuranceCompanyStamp, setInsuranceCompanyStamp] = useState<boolean>(defaultValues?.insuranceCompanyStamp ?? false);
  const [insuranceCompanyTime, setInsuranceCompanyTime] = useState<Date | undefined>(defaultValues?.insuranceCompanyTime);

  const [toValidate, setToValidate] = useState<boolean>(false);
  const [isValidationPassed, setIsValidationPassed] = useState<boolean[]>([]);
  const [saveError, setSaveError] = useState<string>("");
  const [hasPersonalDataConsent, setHasPersonalDataConsent] = useState<boolean>(false);

  const usecase = new InsuranceUsecase(new InsuranceRepoImpl());
  const personalDataConsent = personalDataConsentContent(locale);

  function handleValidate(result: boolean) {
    setToValidate(false);
    setIsValidationPassed((prev) => [...prev, result]);
  }

  function handleDelete() {
    if (updateId === undefined) return;

    usecase.deleteInsurance(updateId)
      .then(() => router.push("/admin/insurance"));
  }

  function handleSave() {
    setSaveError("");
    if (!hasPersonalDataConsent) {
      setSaveError(personalDataConsent.requiredMessage);
      return;
    }
    setIsValidationPassed([]);
    setToValidate(true);
  }

  useEffect(() => {
    if (isValidationPassed.length < 13 ||
      isValidationPassed.some((result) => !result)) return;

    const request = new InsuranceRequest({
      applicationDate: applicationDate!,
      incidentDate: incidentDate!,
      name,
      studentId,
      idNumber,
      address,
      phoneNumber,
      email,
      claimDetails,
      paymentType,
      location,
      incidentCause,
      receipt,
      diagnosisCertificate,
      bankbook,
      xRay,
      applicationAmount: parseInt(applicationAmount),
      remarks,
      claimAmount: claimAmount !== undefined && claimAmount !== "" ? parseInt(claimAmount) : undefined,
      claimDate,
      insuranceCompanyStamp,
      insuranceCompanyTime,
    });

    (updateId === undefined
      ? usecase.createInsurance(request)
      : usecase.updateInsurance(updateId, request)
    ).then(
      () => router.push("/admin/insurance")
    ).catch(
      (err) => {
        console.error(`${updateId === undefined ? "Creating" : "Updating"} insurance failed:`, err);
        setSaveError(err?.response?.data?.message ?? err?.message ?? trans("save"));
      }
    );
  }, [isValidationPassed]);

  return (
    <>
      <h1>{updateId === undefined ? trans("new") : trans("edit")}</h1>
      <form className="mt-6 flex flex-col gap-4">
        <DateField
          label="application_date"
          labelText={trans("application_date")}
          locale={locale}
          value={applicationDate}
          onChange={setApplicationDate}
          onValidate={handleValidate}
          validations={generalValidations}
          toValidate={toValidate}
        />
        <DateField
          label="incident_date"
          labelText={trans("incident_date")}
          locale={locale}
          value={incidentDate}
          onChange={setIncidentDate}
          onValidate={handleValidate}
          validations={generalValidations}
          toValidate={toValidate}
        />
        <TextField
          label="name"
          labelText={trans("name")}
          value={name}
          onChange={setName}
          onValidate={handleValidate}
          validations={generalValidations}
          toValidate={toValidate}
        />
        <TextField
          label="student_id"
          labelText={trans("student_id")}
          value={studentId}
          onChange={setStudentId}
          onValidate={handleValidate}
          validations={numberValidations}
          toValidate={toValidate}
        />
        <TextField
          label="id_number"
          labelText={trans("id_number")}
          value={idNumber}
          onChange={setIdNumber}
          onValidate={handleValidate}
          validations={generalValidations}
          toValidate={toValidate}
        />
        <TextField
          label="address"
          labelText={trans("address")}
          value={address}
          onChange={setAddress}
          onValidate={handleValidate}
          validations={generalValidations}
          toValidate={toValidate}
        />
        <TextField
          label="phone_number"
          labelText={trans("phone_number")}
          value={phoneNumber}
          onChange={setPhoneNumber}
          onValidate={handleValidate}
          validations={numberValidations}
          toValidate={toValidate}
        />
        <TextField
          label="email"
          labelText={trans("email")}
          value={email}
          onChange={setEmail}
          onValidate={handleValidate}
          validations={emailValidations}
          toValidate={toValidate}
        />
        <DropdownButton
          label="claim_detail"
          labelText={trans("claim_detail")}
          options={claimDetailsOptions.map(label => trans(label))}
          className="h-10"
          onChange={(index) => setClaimDetails(claimDetailsOptions[index])}
          index={claimDetailsOptions.indexOf(claimDetails)}
        />
        <DropdownButton
          label="payment_type"
          labelText={trans("payment_type")}
          options={paymentTypeOptions.map(label => trans(label))}
          className="h-10"
          onChange={(index) => setPaymentType(paymentTypeOptions[index])}
          index={paymentTypeOptions.indexOf(paymentType)}
        />
        <DropdownButton
          label="location"
          labelText={trans("location")}
          options={locationOptions.map(label => trans(label))}
          className="h-10"
          onChange={(index) => setLocation(locationOptions[index])}
          index={locationOptions.indexOf(location)}
        />
        <TextField
          label="incident_cause"
          labelText={trans("incident_cause")}
          value={incidentCause}
          onChange={setIncidentCause}
          onValidate={handleValidate}
          validations={generalValidations}
          toValidate={toValidate}
        />
        <TextField
          label="receipt"
          labelText={trans("receipt")}
          value={receipt}
          onChange={setReceipt}
          onValidate={handleValidate}
          validations={generalValidations}
          toValidate={toValidate}
        />
        <TextField
          label="certificate"
          labelText={trans("certificate")}
          value={diagnosisCertificate}
          onChange={setDiagnosisCertificate}
          onValidate={handleValidate}
          validations={generalValidations}
          toValidate={toValidate}
        />
        <DropdownButton
          label="bankbook"
          labelText={trans("bankbook")}
          options={numberOptions}
          className="h-10"
          onChange={(index) => setBankbook(numberOptions[index])}
          index={numberOptions.indexOf(bankbook)}
        />
        <DropdownButton
          label="x_ray"
          labelText={trans("x_ray")}
          options={numberOptions}
          className="h-10"
          onChange={(index) => setXRay(numberOptions[index])}
          index={numberOptions.indexOf(xRay)}
        />
        <TextField
          label="application_amount"
          labelText={trans("application_amount")}
          value={applicationAmount}
          onChange={setApplicationAmount}
          onValidate={handleValidate}
          validations={numberValidations}
          toValidate={toValidate}
        />
        <TextField
          label="claim_amount"
          labelText={trans("claim_amount")}
          value={claimAmount}
          onChange={setClaimAmount}
          onValidate={handleValidate}
          validations={optionalNumberValidations}
          toValidate={toValidate}
        />
        <DateField
          label="claim_date"
          labelText={trans("claim_date")}
          locale={locale}
          value={claimDate}
          onChange={setClaimDate}
        />
        <TextField
          label="remarks"
          labelText={trans("remarks")}
          value={remarks}
          onChange={setRemarks}
        />
        <section className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-xl font-semibold">{personalDataConsent.title}</h2>
          <div className="mt-3 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-sm leading-7">
            {personalDataConsent.sections.map((section, index) => (
              <div key={index} className={index === 0 ? "" : "mt-4"}>
                {section.heading && <h3 className="font-semibold">{section.heading}</h3>}
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="mt-1">{paragraph}</p>
                ))}
              </div>
            ))}
          </div>
          <label htmlFor="personal_data_consent" className="mt-3 flex flex-row gap-2 items-start">
            <input
              id="personal_data_consent"
              type="checkbox"
              className="mt-1 size-4 shrink-0"
              checked={hasPersonalDataConsent}
              onChange={(event) => {
                setHasPersonalDataConsent(event.target.checked);
                if (event.target.checked && saveError === personalDataConsent.requiredMessage) {
                  setSaveError("");
                }
              }}
            />
            <span>{personalDataConsent.checkboxLabel}</span>
          </label>
        </section>
        <div>
          <label htmlFor="insurance_company_stamp" className="label">{trans("insurance_company_stamp")}</label>
          <div className="flex flex-row gap-2 items-center">
            <input
              id="insurance_company_stamp"
              type="checkbox"
              className="size-4 my-1"
              checked={insuranceCompanyStamp}
              onChange={(event) => {
                const checked = event.target.checked;
                setInsuranceCompanyStamp(checked);
                setInsuranceCompanyTime(checked ? (insuranceCompanyTime ?? new Date()) : undefined);
              }}
            />
            {insuranceCompanyStamp && (
              <DateField
                label="insurance_company_timestamp"
                labelText={trans("insurance_company_time")}
                locale={locale}
                value={insuranceCompanyTime}
                onChange={setInsuranceCompanyTime}
              />
            )}
          </div>
        </div>
        {saveError && <p className="text-red-500 text-sm font-medium">{saveError}</p>}
        <div className="flex flex-row justify-end gap-2">
          {
            updateId !== undefined &&
            <Button className="border" onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} className="me-2 size-4" />
              <span className="py-1">{trans("delete")}</span>
            </Button>
          }
          <Button className="border" onClick={handleSave}>
            <FontAwesomeIcon icon={faSave} className="me-2 size-4" />
            <span className="py-1">{trans("save")}</span>
          </Button>
        </div>
      </form>
    </>
  );
}

const generalValidations = [
  new NotEmptyValidationUsecase("欄位不可為空"),
];

const numberValidations = [
  ...generalValidations,
  new NumberValidationUsecase("請輸入數字"),
];

const optionalNumberValidations = [
  new NumberValidationUsecase("請輸入數字"),
];

const emailValidations = [
  ...generalValidations,
  new EmailValidationUsecase("Email 格式不正確"),
];

const claimDetailsOptions = [
  ClaimDetailsEnum.Accident,
  ClaimDetailsEnum.Illness,
];

const paymentTypeOptions = [
  PaymentTypeEnum.Medical,
  PaymentTypeEnum.Disablement,
  PaymentTypeEnum.Cancer,
  PaymentTypeEnum.Death,
];

const locationOptions = [
  LocationEnum.OnCampus,
  LocationEnum.OffCampus,
];

const numberOptions = [0, 1, 2, 3];

function personalDataConsentContent(locale: string) {
  if (locale === "en") {
    return {
      title: "Student Group Insurance Personal Data Consent",
      checkboxLabel: "I confirm that the applicant has read and accepted the personal data consent statement above.",
      requiredMessage: "Please confirm the personal data consent before saving this insurance record.",
      sections: [
        {
          heading: "",
          paragraphs: [
            "By checking this consent item, the applicant confirms that they have read, understood, and agreed to the contents of this consent statement. If the applicant is under the age of 18, their legal representative should also read, understand, and agree to the statement before this service is used.",
          ],
        },
        {
          heading: "Collection, update, and retention of basic personal data",
          paragraphs: [
            "National Central University collects, processes, and uses personal data in accordance with the Personal Data Protection Act and related laws, as well as the university privacy policy.",
            "The applicant should provide accurate, current, and complete personal data. Personal data collected for student group insurance may include name, student ID number, national ID number, address, contact information including phone and email, health condition, medical documents, and related receipts.",
            "If the applicant's personal data changes, the applicant should request correction so that the data remains accurate, current, and complete. If incorrect, outdated, incomplete, false, or misleading data is provided, related rights and interests may be affected.",
            "The applicant may exercise rights under the Personal Data Protection Act, including requesting inquiry or review, requesting copies, requesting supplementation or correction, requesting cessation of collection, processing, or use, and requesting deletion. The university may refuse a request when the data is necessary for official duties or business operations.",
          ],
        },
        {
          heading: "Purpose of collecting personal data",
          paragraphs: [
            "The university collects personal data for student group insurance application, claim handling, and related contact and administrative operations.",
            "If the university needs to use personal data in a way different from the original collection purpose, written consent will be obtained before use. The applicant may refuse to provide personal data, but related rights and services may be affected.",
            "The period of use is within 10 years from the date of consent, and the area of use is Taiwan.",
          ],
        },
        {
          heading: "Confidentiality of basic personal data",
          paragraphs: [
            "The applicant's personal data is protected and governed by the university privacy policy. If personal data is stolen, leaked, altered, or otherwise infringed due to violation of the Personal Data Protection Act or due to natural disaster, incident, or other force majeure, the university will notify the applicant by phone, mail, email, website announcement, or another appropriate method after investigation.",
          ],
        },
        {
          heading: "Effect of this consent statement",
          paragraphs: [
            "Checking this consent item means the applicant has read, understood, and agreed to all contents of this consent statement.",
            "The university reserves the right to amend this consent statement. Amendments will be announced on the university website and will not be individually notified.",
            "Any advice or information obtained from this consent statement, whether written or oral, does not constitute any warranty beyond the express provisions of this statement.",
          ],
        },
        {
          heading: "Governing law and jurisdiction",
          paragraphs: [
            "The interpretation, application, and disputes related to this consent statement shall be handled in accordance with the laws of the Republic of China, with the Taiwan Taoyuan District Court as the court of jurisdiction.",
          ],
        },
      ],
    };
  }

  return {
    title: "學生團體保險個人資料提供同意書",
    checkboxLabel: "已確認申請人已閱讀並接受上述個人資料提供同意書內容",
    requiredMessage: "請先確認申請人已閱讀並接受個人資料提供同意書內容，再儲存保險記錄。",
    sections: [
      {
        heading: "",
        paragraphs: [
          "當申請人勾選同意並簽署本同意書時，表示申請人已閱讀、瞭解並同意接受本同意書之所有內容及其後修改變更規定。若申請人未滿十八歲，應於法定代理人閱讀、瞭解並同意本同意書之所有內容及其後修改變更規定後，方得使用本服務；若已接受本服務，視為已取得法定代理人之同意，並遵守以下所有規範。",
        ],
      },
      {
        heading: "一、基本資料之蒐集、更新及保管",
        paragraphs: [
          "本校蒐集申請人之個人資料，係在中華民國個人資料保護法與相關法令之規範下，依據本校隱私權政策聲明，蒐集、處理及利用個人資料。",
          "請於申請時提供申請人本人正確、最新及完整的個人資料。",
          "本校因辦理學生團體保險申請、理賠及相關聯繫作業所蒐集之個人資料，包括姓名、學號、身分證字號、地址、聯絡方式（電話、E-Mail）、健康情形、醫療文件與相關收據等。",
          "若申請人個人資料有任何異動，請主動向本校申請更正，使其保持正確、最新及完整。若提供錯誤、不實、過時、不完整或具誤導性的資料，申請人將可能損失相關權益。",
          "申請人可依中華民國個人資料保護法，就個人資料請求查詢或閱覽、製給複製本、補充或更正、停止蒐集處理及利用、刪除。但因本校執行職務或業務所必須者，本校得拒絕之。若因申請人行使上述權利而導致權益受損時，本校將不負相關賠償責任。",
        ],
      },
      {
        heading: "二、蒐集個人資料之目的",
        paragraphs: [
          "本校為辦理學生團體保險申請、理賠及相關聯繫作業，需蒐集申請人之個人資料。",
          "當申請人個人資料使用方式與原蒐集目的不同時，本校會在使用前先徵求書面同意。申請人可以拒絕向本校提供個人資料，但可能因此喪失相關權益。",
          "本校利用申請人個人資料期間為即日起十年內，利用地區為臺灣地區。",
        ],
      },
      {
        heading: "三、基本資料之保密",
        paragraphs: [
          "申請人之個人資料受到本校隱私權政策聲明之保護及規範。本校如違反個人資料保護法規定，或因天災、事變或其他不可抗力所致，使申請人個人資料被竊取、洩漏、竄改或遭其他侵害者，本校將於查明後以電話、信函、電子郵件或網站公告等方式，擇適當方式通知申請人。",
        ],
      },
      {
        heading: "四、同意書之效力",
        paragraphs: [
          "當申請人勾選同意並簽署本同意書時，即表示已閱讀、瞭解並同意本同意書之所有內容。",
          "本校保留隨時修改本同意書規範之權利，並將於修改規範時於本校網頁公告修改事實，不另作個別通知。若不同意修改內容，請勿繼續接受本服務；否則將視為已同意並接受本同意書增訂或修改內容之拘束。",
          "申請人自本同意書取得之任何建議或資訊，無論為書面或口頭形式，除非本同意書條款有明確規定，均不構成本同意書條款以外之任何保證。",
        ],
      },
      {
        heading: "五、準據法與管轄法院",
        paragraphs: [
          "本同意書之解釋與適用，以及與本同意書有關之爭議，均應依照中華民國法律處理，並以臺灣桃園地方法院為管轄法院。",
        ],
      },
    ],
  };
}
