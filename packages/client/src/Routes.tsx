import React, {
  FC,
  ReactElement,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import tokenService from "./services/token.service";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmailBuilder from "pages/EmailBuilder";
import { ActionType, getUserPermissions } from "reducers/auth.reducer";
import SlackBuilder from "pages/SlackBuilder";
import Cor from "pages/Cor";
import { useDispatch } from "react-redux";
import DrawerLayout from "components/DrawerLayout";
import TableBeta from "pages/TemplateTable/TableBeta";
import Verify from "pages/Verify";
import SmsBuilder from "pages/SmsBuilder";
import Database from "pages/Integrations/Database";
import Integrations from "pages/Integrations/Integrations";
import Modal from "components/Elements/Modal";
import ApiService from "services/api.service";
import Account from "types/Account";
import { GenericButton } from "components/Elements";
import FirebaseBuilder from "pages/FirebaseBuilder/FirebaseBuilder";
import ResetPassword from "pages/ResetPassword";
import SegmentViewer from "pages/SegmentViewer";
import ModalBuilder from "pages/ModalBuilder";
import WebhookBuilder from "pages/WebhookBuilder";
import EventTracker from "pages/EventTracker";
import ModalBackgroundProvider from "pages/ModalBuilder/ModalBackgroundProvider";
import FlowBuilderv2 from "pages/FlowBuilderv2";
import FlowViewerv2 from "pages/FlowViewerv2";
import Onboardingv2 from "pages/Onboardingv2";
import Homev2 from "pages/Homev2";
import Verificationv2 from "pages/Verificationv2";
import { toast } from "react-toastify";
import JourneyTablev2 from "pages/JourneyTablev2";
import TemplateTablev2 from "pages/TemplateTablev2";
import PeopleTablev2 from "pages/PeopleTablev2";
import SegmentTablev2 from "pages/SegmentTablev2";
import TrackerTemplateBuilder from "pages/TrackerTemplateBuilder";
import Settingsv2 from "pages/Settingsv2";
import EmailSettings from "pages/EmailSettings/EmailSettings";
import TwilioSettings from "pages/TwilioSettings";
import PosthogSettings from "pages/PosthogSettings";
import JavascriptSnippetSettings from "pages/JavascriptSnippetSettings";
import CustomModalSettings from "pages/CustomModalSettings";
import TrackerTemplateTable from "pages/TrackerTemplateTable";
import { LaudspeakerProvider } from "@laudspeaker/react";
import AppConfig from "constants/app";
import Personv2 from "pages/Personv2";
import SegmentCreation from "pages/SegmentCreation/index";

interface IProtected {
  children: ReactElement;
}

const Protected = ({ children }: IProtected) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  useLayoutEffect(() => {
    const func = async () => {
      const loggedIn = await tokenService.verify();
      if (!loggedIn) navigate("/login");
      setIsLoggedIn(loggedIn);
    };
    func();
  }, []);

  const dispatch = useDispatch();
  if (isLoggedIn) {
    dispatch(getUserPermissions());
  }

  return isLoggedIn ? children : <></>;
};

interface VerificationProtectedProps {
  children: ReactNode;
}

const VerificationProtected: FC<VerificationProtectedProps> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data } = await ApiService.get({ url: "/accounts" });
      const { verified } = data;
      setIsVerified(verified);
      setIsLoaded(true);
    } catch (e) {
      toast.error("Error while loading data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded && !isVerified) navigate("/verification");
  }, [isVerified, isLoaded]);

  return isVerified ? <>{children}</> : <></>;
};

export interface WelcomeBannerProviderProps {
  children: ReactNode;
  hidden: boolean;
  setHidden: (value: boolean) => void;
}

const WelcomeBannerProvider: FC<WelcomeBannerProviderProps> = ({
  children,
  hidden,
  setHidden,
}) => {
  const [firstName, setFirstName] = useState("");

  const navigate = useNavigate();

  return (
    <>
      {children}
      <Modal isOpen={!hidden} onClose={() => setHidden(true)}>
        <div>
          <h3 className="font-[Inter] font-semibold text-[20px] leading-[38px]">
            Welcome {firstName}
          </h3>
          <p>
            Thank you for trying Laudspeaker. To get started we need to do 3
            things
            <ol className="list-decimal pl-[30px] py-[10px]">
              <li>Set up messaging channels</li>
              <li>Set up event streaming</li>
              <li>Optionally import your customers</li>
            </ol>
            <div>
              <p>
                If you get stuck and need help - join our{" "}
                <span className="underline decoration-dashed">
                  <a
                    href="https://join.slack.com/t/laudspeakerusers/shared_invite/zt-1li25huaq-BljJUA1Zm8dXvbZViAbMwg"
                    target="_blank"
                  >
                    slack group
                  </a>
                </span>
              </p>
            </div>
          </p>
          <div className="flex justify-end items-center gap-[10px] mt-[20px]">
            <GenericButton
              customClasses="grayscale"
              onClick={() => {
                localStorage.setItem("dontShowAgain", "true");
                setHidden(true);
              }}
            >
              I no longer need this
            </GenericButton>
            <GenericButton
              onClick={() => {
                setHidden(true);
                navigate("/onboarding");
              }}
            >
              Next
            </GenericButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

const RouteComponent: React.FC = () => {
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ApiService.get<Account>({ url: "/accounts" });

        dispatch({
          type: ActionType.LOGIN_USER_SUCCESS,
          payload: {
            firstName: data.firstName,
            lastName: data.lastName,
            uId: data.id,
            onboarded: data.onboarded,
            email: data.email,
            expectedOnboarding: data.expectedOnboarding,
            verified: data.verified,
          },
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login setShowWelcomeBanner={setShowWelcomeBanner} />}
        />
        <Route
          path="/signup"
          element={<Signup setShowWelcomeBanner={setShowWelcomeBanner} />}
        />
        <Route
          path="/"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <Homev2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/verify-email/:id"
          element={
            <Protected>
              <DrawerLayout>
                <Verify />
              </DrawerLayout>
            </Protected>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:id" element={<ResetPassword />} />
        <Route
          path="/flow"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout
                  crumbs={[{ text: "Journey builder", link: "/flow" }]}
                >
                  <JourneyTablev2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/flow/:id"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout
                  crumbs={[
                    { text: "Journey builder", link: "/flow" },
                    { text: "Create a journey" },
                  ]}
                  expandable
                >
                  <FlowBuilderv2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/flow/:id/v2"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout
                  crumbs={[
                    { text: "Journey builder", link: "/flow" },
                    { text: "Create a journey" },
                  ]}
                  expandable
                >
                  <FlowBuilderv2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/event-tracker"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <EventTracker />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/flow/:id/view"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout
                  expandable
                  crumbs={[
                    { text: "Journey builder", link: "/flow" },
                    { text: "Journey" },
                  ]}
                >
                  <FlowViewerv2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/people"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <PeopleTablev2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/person/:id"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <Personv2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />

        <Route
          path="/segment"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <SegmentTablev2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/segment/create"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <SegmentCreation />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/segment/:id"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <SegmentViewer />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/email-builder"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <EmailBuilder />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/slack-builder"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <SlackBuilder />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/sms-builder"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <SmsBuilder />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/templates/email/:name"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <EmailBuilder />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        {/* Removed for 1 release
         <Route
          path="/templates/slack/:name"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <SlackBuilder />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        /> */}
        <Route
          path="/templates/sms/:name"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <SmsBuilder />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        {/* Removed for 1 release
        <Route
          path="/templates/firebase/:name"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <FirebaseBuilder />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        */}
        <Route
          path="/templates/webhook/:name"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <WebhookBuilder />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        {/*
        <Route
          path="/templates/modal/:name"
          element={
            <Protected>
              <VerificationProtected>
                <ModalBackgroundProvider>
                  <ModalBuilder />
                </ModalBackgroundProvider>
              </VerificationProtected>
            </Protected>
          }
        /> */}
        <Route
          path="/templates"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <TemplateTablev2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/tracker-template/:id"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <TrackerTemplateBuilder />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/tracker-template"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <TrackerTemplateTable />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        {/* Removed for version 1 release
        <Route
          path="/integrations"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <Integrations />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/integrations/db"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <Database />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/integrations/db/:id"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <Database />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        /> */}
        <Route
          path="/verification"
          element={
            <Protected>
              <Verificationv2 />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <Settingsv2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/settings/email"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <EmailSettings />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/settings/sms"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <TwilioSettings />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/settings/custom-modal"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <CustomModalSettings />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/settings/posthog"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <PosthogSettings />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/settings/javascript-snippet"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <JavascriptSnippetSettings />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/beta/table"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <TableBeta />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/home"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <Homev2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/onboarding"
          element={
            <Protected>
              <VerificationProtected>
                <LaudspeakerProvider
                  apiKey={AppConfig.ONBOARDING_API_KEY ?? "onboarding-api-key"}
                  apiHost={AppConfig.WS_BASE_URL}
                >
                  <Onboardingv2 />
                </LaudspeakerProvider>
              </VerificationProtected>
            </Protected>
          }
        />
        <Route
          path="/slack/cor/:id"
          element={
            <Protected>
              <VerificationProtected>
                <Cor />
              </VerificationProtected>
            </Protected>
          }
        />
        {/* 
        TEMP: uncomment in future
        <Route
          path="/journeys"
          element={
            <Protected>
              <Onboarded>
                <Journeys />
              </Onboarded>
            </Protected>
          }
        /> */}
        <Route
          path="*"
          element={
            <Protected>
              <VerificationProtected>
                <DrawerLayout>
                  <JourneyTablev2 />
                </DrawerLayout>
              </VerificationProtected>
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default RouteComponent;
