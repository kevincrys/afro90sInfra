import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { AppConfig } from '../config';

export interface SiteCertificateProps {
  config: AppConfig;
  hostedZone: route53.IHostedZone;
}

export class SiteCertificate extends Construct {
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: SiteCertificateProps) {
    super(scope, id);

    const { config, hostedZone } = props;
    const domainName = config.domainName!;

    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: [`*.${domainName}`],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });
  }
}
